import type { MovementIssue, StockMovement } from "@/registry/lib/stock-ledger"

export const filled = { mode: "filled" as const }
export const empty = { mode: "empty" as const }
export const loading = { mode: "loading" as const }
export const error = { mode: "error" as const }

export const skus = [
  { id: "SKU-0001", label: "SKU-0001" },
  { id: "SKU-0002", label: "SKU-0002" },
]

export function warehouses(locale: "es" | "en") {
  return locale === "en"
    ? [
        { id: "norte", label: "North warehouse" },
        { id: "sur", label: "South warehouse" },
      ]
    : [
        { id: "norte", label: "Almacén Norte" },
        { id: "sur", label: "Almacén Sur" },
      ]
}

export function reasons(locale: "es" | "en") {
  return locale === "en"
    ? [
        { id: "count", label: "Count" },
        { id: "damage", label: "Damage" },
      ]
    : [
        { id: "count", label: "Conteo" },
        { id: "damage", label: "Merma" },
      ]
}

export const movements: StockMovement[] = [
  { id: "in-1", at: "2026-03-01T15:00:00.000Z", sku: "SKU-0001", warehouseId: "norte", kind: "in", qty: 40, ref: "OC-100" },
  { id: "out-1", at: "2026-03-02T15:00:00.000Z", sku: "SKU-0001", warehouseId: "norte", kind: "out", qty: -12, ref: "OV-100" },
  { id: "in-sur", at: "2026-03-03T15:00:00.000Z", sku: "SKU-0001", warehouseId: "sur", kind: "in", qty: 10, ref: "OC-200" },
  { id: "adj-2", at: "2026-03-04T15:00:00.000Z", sku: "SKU-0002", warehouseId: "sur", kind: "adjust", qty: 6, reason: "conteo", ref: "AJ-6" },
]

export const negativeMovements: StockMovement[] = [
  { id: "open", at: "2026-04-01T12:00:00.000Z", sku: "SKU-0002", warehouseId: "norte", kind: "in", qty: 2, ref: "OC-2" },
  { id: "drop", at: "2026-04-02T12:00:00.000Z", sku: "SKU-0002", warehouseId: "norte", kind: "adjust", qty: -5, reason: "merma", ref: "AJ-5" },
]

export const postedMovement: StockMovement = {
  id: "posted",
  at: "2026-04-03T12:00:00.000Z",
  sku: "SKU-0002",
  warehouseId: "norte",
  kind: "adjust",
  qty: 8,
  reason: "conteo",
  ref: "AJ-8",
}

export const insufficientIssue: MovementIssue = { field: "qty", code: "insufficient" }
export const zeroIssue: MovementIssue = { field: "qty", code: "qty_zero" }
export const reasonIssue: MovementIssue = { field: "reason", code: "reason_required" }
export const sameWarehouseIssue: MovementIssue = { field: "destinationWarehouseId", code: "same_warehouse" }

export const longSku = `SKU-${"A".repeat(76)}`
export const longReason = "Caja abierta en el andén. ".repeat(8).trim()
