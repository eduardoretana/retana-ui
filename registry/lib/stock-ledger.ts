/**
 * Stock ledger core. Clean-room: behavior only, no template source or assets.
 * Running balances use a stable order (timestamp, then id) per SKU and warehouse.
 * Signed quantities use U+2212. The accessible name says the sign in words.
 */

export type StockMovementKind = "in" | "out" | "adjust" | "transfer_out" | "transfer_in"

export type StockMovement = {
  id: string
  /** ISO-8601 timestamp. Ordering falls back to text when it does not parse. */
  at: string
  sku: string
  warehouseId: string
  kind: StockMovementKind
  /** Signed integer. Receipts and transfer-ins are positive. Issues and transfer-outs are negative. */
  qty: number
  reason?: string
  ref?: string
  transferId?: string
}

export type StockBalanceRow = {
  movement: StockMovement
  balance: number
  negative: boolean
}

export type StockScope = {
  sku?: string
  warehouseId?: string
}

export type StockDraftKind = "in" | "out" | "adjust" | "transfer"

export type MovementField = "sku" | "warehouseId" | "destinationWarehouseId" | "qty" | "reason"

export type MovementIssueCode =
  | "required"
  | "qty_zero"
  | "qty_not_integer"
  | "qty_sign"
  | "insufficient"
  | "reason_required"
  | "same_warehouse"

export type MovementIssue = {
  field: MovementField
  code: MovementIssueCode
}

export type StockMovementDraft = {
  sku: string
  warehouseId: string
  destinationWarehouseId?: string
  kind: StockDraftKind
  /** Signed for in, out, and adjust. Positive magnitude for a transfer. */
  qty: number
  reason?: string
  ref?: string
}

export type TransferDraft = {
  sku: string
  fromWarehouseId: string
  toWarehouseId: string
  qty: number
  at: string
  transferId: string
  reason?: string
  ref?: string
}

export type MovementTotals = {
  inbound: number
  outbound: number
  net: number
}

const MINUS = "\u2212"

export function balanceKey(sku: string, warehouseId: string) {
  return `${sku}\u0000${warehouseId}`
}

function compareAt(left: string, right: string) {
  if (left === right) return 0
  const leftMs = Date.parse(left)
  const rightMs = Date.parse(right)
  if (Number.isFinite(leftMs) && Number.isFinite(rightMs) && leftMs !== rightMs) return leftMs - rightMs
  return left < right ? -1 : 1
}

function compareMovements(left: StockMovement, right: StockMovement, leftIndex: number, rightIndex: number) {
  const byTime = compareAt(left.at, right.at)
  if (byTime !== 0) return byTime
  if (left.id !== right.id) return left.id < right.id ? -1 : 1
  return leftIndex - rightIndex
}

/** Global running balance per SKU and warehouse. `scope` only hides rows. */
export function runningBalances(movements: readonly StockMovement[], scope?: StockScope): StockBalanceRow[] {
  const ordered = movements.map((movement, index) => ({ movement, index }))
  ordered.sort((left, right) => compareMovements(left.movement, right.movement, left.index, right.index))
  const totals = new Map<string, number>()
  const rows: StockBalanceRow[] = []
  for (const entry of ordered) {
    const key = balanceKey(entry.movement.sku, entry.movement.warehouseId)
    const balance = (totals.get(key) ?? 0) + entry.movement.qty
    totals.set(key, balance)
    if (scope?.sku !== undefined && entry.movement.sku !== scope.sku) continue
    if (scope?.warehouseId !== undefined && entry.movement.warehouseId !== scope.warehouseId) continue
    rows.push({ movement: entry.movement, balance, negative: balance < 0 })
  }
  return rows
}

/** Latest balance for every SKU and warehouse that appears. */
export function balanceBy(movements: readonly StockMovement[]) {
  const totals = new Map<string, number>()
  for (const row of runningBalances(movements)) {
    totals.set(balanceKey(row.movement.sku, row.movement.warehouseId), row.balance)
  }
  return totals
}

function available(balances: ReadonlyMap<string, number>, sku: string, warehouseId: string) {
  return balances.get(balanceKey(sku, warehouseId)) ?? 0
}

/** Field errors. Empty means the draft can be posted. */
export function validateMovement(draft: StockMovementDraft, balances: ReadonlyMap<string, number>): MovementIssue[] {
  const issues: MovementIssue[] = []
  if (!draft.sku.trim()) issues.push({ field: "sku", code: "required" })
  if (!draft.warehouseId.trim()) issues.push({ field: "warehouseId", code: "required" })
  const destination = draft.destinationWarehouseId?.trim() ?? ""
  if (draft.kind === "transfer" && !destination) {
    issues.push({ field: "destinationWarehouseId", code: "required" })
  } else if (draft.kind === "transfer" && destination === draft.warehouseId.trim()) {
    issues.push({ field: "destinationWarehouseId", code: "same_warehouse" })
  }

  if (!Number.isInteger(draft.qty)) {
    issues.push({ field: "qty", code: "qty_not_integer" })
  } else if (draft.qty === 0) {
    issues.push({ field: "qty", code: "qty_zero" })
  } else if ((draft.kind === "in" || draft.kind === "transfer") && draft.qty < 0) {
    issues.push({ field: "qty", code: "qty_sign" })
  } else if (draft.kind === "out" || draft.kind === "transfer" || (draft.kind === "adjust" && draft.qty < 0)) {
    const leaving = draft.kind === "transfer" ? draft.qty : Math.abs(draft.qty)
    if (leaving > available(balances, draft.sku, draft.warehouseId)) {
      issues.push({ field: "qty", code: "insufficient" })
    }
  }

  if (draft.kind === "adjust" && !draft.reason?.trim()) {
    issues.push({ field: "reason", code: "reason_required" })
  }
  return issues
}

/** One transfer id, opposite quantities, net zero across warehouses. */
export function toTransferPair(draft: TransferDraft): [StockMovement, StockMovement] {
  const qty = Math.abs(Math.trunc(draft.qty))
  const shared: Pick<StockMovement, "sku" | "at" | "transferId"> = {
    sku: draft.sku,
    at: draft.at,
    transferId: draft.transferId,
  }
  const out: StockMovement = {
    ...shared,
    id: `${draft.transferId}:out`,
    warehouseId: draft.fromWarehouseId,
    kind: "transfer_out",
    qty: -qty,
  }
  const inn: StockMovement = {
    ...shared,
    id: `${draft.transferId}:in`,
    warehouseId: draft.toWarehouseId,
    kind: "transfer_in",
    qty,
  }
  if (draft.reason !== undefined) {
    out.reason = draft.reason
    inn.reason = draft.reason
  }
  if (draft.ref !== undefined) {
    out.ref = draft.ref
    inn.ref = draft.ref
  }
  return [out, inn]
}

/** True when on-hand is at or below the reorder point. */
export function belowReorder(balance: number, reorderPoint: number) {
  return balance <= reorderPoint
}

export function movementTotals(movements: readonly StockMovement[]): MovementTotals {
  let inbound = 0
  let outbound = 0
  for (const movement of movements) {
    if (movement.qty > 0) inbound += movement.qty
    else outbound += -movement.qty
  }
  return { inbound, outbound, net: inbound - outbound }
}

function grouped(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.abs(Math.trunc(value)))
}

function english(locale: string) {
  return locale.toLowerCase().startsWith("en")
}

/** `+40`, `−12` (U+2212), or `0`. */
export function formatSignedQuantity(qty: number, locale: string) {
  const digits = grouped(qty, locale)
  if (qty > 0) return `+${digits}`
  if (qty < 0) return `${MINUS}${digits}`
  return digits
}

/** "más 40 unidades" / "plus 40 units". The glyph is not the accessible name. */
export function quantityAccessibleName(qty: number, unit: string, locale: string) {
  const digits = grouped(qty, locale)
  if (qty > 0) return english(locale) ? `plus ${digits} ${unit}` : `más ${digits} ${unit}`
  if (qty < 0) return english(locale) ? `minus ${digits} ${unit}` : `menos ${digits} ${unit}`
  return `${digits} ${unit}`
}

/** No sign unless the balance is negative. */
export function formatBalance(balance: number, locale: string) {
  const digits = grouped(balance, locale)
  return balance < 0 ? `${MINUS}${digits}` : digits
}

export function balanceAccessibleName(balance: number, unit: string, locale: string) {
  const digits = grouped(balance, locale)
  if (balance < 0) return english(locale) ? `minus ${digits} ${unit}` : `menos ${digits} ${unit}`
  return `${digits} ${unit}`
}

export function formatMovementDate(at: string, locale: string) {
  const ms = Date.parse(at)
  if (!Number.isFinite(ms)) return at
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(ms)
}
