"use client"

/**
 * Stock ledger. Clean-room reading of a public inventory list: running balance
 * per SKU and warehouse, signed quantities, and a card list at 390px.
 * No template source, copy, icons, or assets. RUI-QTY-001 and RUI-BAL-001
 * are applied as draft rules, not as a hub change.
 */

import * as React from "react"
import { useReducedMotion } from "motion/react"
import {
  ArrowDownToLine,
  ArrowRightFromLine,
  ArrowRightToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useMinWidth } from "@/registry/retana/hooks/use-min-width"
import {
  balanceAccessibleName,
  balanceBy,
  formatBalance,
  formatMovementDate,
  formatSignedQuantity,
  movementTotals,
  quantityAccessibleName,
  runningBalances,
  type StockMovement,
  type StockMovementKind,
} from "@/registry/retana/lib/stock-ledger"
import { AdminDataTable } from "@/registry/retana/ui/data-table"
import { EventLog } from "@/registry/retana/ui/event-log"
import { StatStrip } from "@/registry/retana/ui/stat-strip"
import { StatusPill, type StatusTone } from "@/registry/retana/ui/status-pill"

export type StockLedgerStatus = "ready" | "loading" | "error"

export type StockBalanceScope = "global" | "filter"

export type StockLedgerFilters = {
  kind: StockMovementKind | "all"
  warehouseId: string
  from: string
  to: string
  query: string
  balanceScope: StockBalanceScope
}

export const emptyStockLedgerFilters: StockLedgerFilters = {
  kind: "all",
  warehouseId: "all",
  from: "",
  to: "",
  query: "",
  balanceScope: "global",
}

export type StockLedgerClassNames = {
  root?: string
  header?: string
  toolbar?: string
  table?: string
  card?: string
  qty?: string
  balance?: string
}

export type StockLedgerLabels = {
  caption: string
  captionForSku: (sku: string) => string
  date: string
  type: string
  reference: string
  warehouse: string
  quantity: string
  balanceGlobal: string
  balanceFiltered: string
  emptyTitle: string
  emptyAction: string
  transferAction: string
  filteredEmptyTitle: string
  clearFilters: string
  loading: string
  errorTitle: string
  retry: string
  negative: string
  filters: string
  closeFilters: string
  kind: string
  allKinds: string
  allWarehouses: string
  from: string
  to: string
  search: string
  scope: string
  scopeGlobal: string
  scopeFiltered: string
  onHand: string
  inbound: string
  outbound: string
  net: string
  logTitle: string
  noReference: string
  unit: string
  kinds: Record<StockMovementKind, string>
}

const kindTone: Record<StockMovementKind, StatusTone> = {
  in: "positive",
  out: "info",
  adjust: "accent",
  transfer_out: "neutral",
  transfer_in: "neutral",
}

const kindIcon = {
  in: ArrowDownToLine,
  out: ArrowUpFromLine,
  adjust: SlidersHorizontal,
  transfer_out: ArrowRightFromLine,
  transfer_in: ArrowRightToLine,
} as const

const numericStyle = { fontVariantNumeric: "tabular-nums", textAlign: "end" } as const

export function stockLedgerLabels(locale: string): StockLedgerLabels {
  if (locale.toLowerCase().startsWith("en")) {
    return {
      caption: "Inventory movements",
      captionForSku: (sku) => `Movements for ${sku}`,
      date: "Date",
      type: "Type",
      reference: "Reference",
      warehouse: "Warehouse",
      quantity: "Quantity",
      balanceGlobal: "Global balance",
      balanceFiltered: "Filtered balance",
      emptyTitle: "No movements",
      emptyAction: "Record adjustment",
      transferAction: "Record transfer",
      filteredEmptyTitle: "No movements match",
      clearFilters: "Clear filters",
      loading: "Loading movements",
      errorTitle: "The ledger could not be read",
      retry: "Retry",
      negative: "Negative balance",
      filters: "Filters",
      closeFilters: "Close filters",
      kind: "Type",
      allKinds: "All types",
      allWarehouses: "All warehouses",
      from: "From",
      to: "To",
      search: "Search SKU",
      scope: "Balance",
      scopeGlobal: "Global",
      scopeFiltered: "Filtered",
      onHand: "On hand",
      inbound: "Inbound",
      outbound: "Outbound",
      net: "Net",
      logTitle: "Movement log",
      noReference: "No reference",
      unit: "units",
      kinds: {
        in: "In",
        out: "Out",
        adjust: "Adjustment",
        transfer_out: "Transfer out",
        transfer_in: "Transfer in",
      },
    }
  }
  return {
    caption: "Movimientos de inventario",
    captionForSku: (sku) => `Movimientos de ${sku}`,
    date: "Fecha",
    type: "Tipo",
    reference: "Referencia",
    warehouse: "Almacén",
    quantity: "Cantidad",
    balanceGlobal: "Saldo global",
    balanceFiltered: "Saldo del filtro",
    emptyTitle: "No hay movimientos",
    emptyAction: "Registrar ajuste",
    transferAction: "Registrar transferencia",
    filteredEmptyTitle: "Ningún movimiento coincide",
    clearFilters: "Limpiar filtros",
    loading: "Cargando movimientos",
    errorTitle: "No se pudo leer el libro",
    retry: "Reintentar",
    negative: "Saldo negativo",
    filters: "Filtros",
    closeFilters: "Cerrar filtros",
    kind: "Tipo",
    allKinds: "Todos los tipos",
    allWarehouses: "Todos los almacenes",
    from: "Desde",
    to: "Hasta",
    search: "Buscar SKU",
    scope: "Saldo",
    scopeGlobal: "Global",
    scopeFiltered: "Del filtro",
    onHand: "Disponible",
    inbound: "Entradas",
    outbound: "Salidas",
    net: "Neto",
    logTitle: "Registro de movimientos",
    noReference: "Sin referencia",
    unit: "unidades",
    kinds: {
      in: "Entrada",
      out: "Salida",
      adjust: "Ajuste",
      transfer_out: "Transferencia de salida",
      transfer_in: "Transferencia de entrada",
    },
  }
}

export type StockLedgerProps = {
  movements: readonly StockMovement[]
  warehouses: readonly { id: string; label: string }[]
  sku?: string
  status?: StockLedgerStatus
  error?: string
  onRetry?: () => void
  filters?: StockLedgerFilters
  onFiltersChange?: (filters: StockLedgerFilters) => void
  locale?: string
  unit?: string
  labels?: Partial<Omit<StockLedgerLabels, "kinds" | "captionForSku">> & {
    kinds?: Partial<StockLedgerLabels["kinds"]>
    captionForSku?: StockLedgerLabels["captionForSku"]
  }
  className?: string
  classNames?: StockLedgerClassNames
  onAdjust?: () => void
  onTransfer?: () => void
  highlightIds?: readonly string[]
}

type LedgerRow = {
  id: string
  movement: StockMovement
  balance: number
  negative: boolean
}

function mergeLabels(locale: string, labels: StockLedgerProps["labels"]): StockLedgerLabels {
  const base = stockLedgerLabels(locale)
  if (!labels) return base
  return { ...base, ...labels, kinds: { ...base.kinds, ...labels.kinds } }
}

function inDateRange(movement: StockMovement, filters: StockLedgerFilters) {
  const day = movement.at.slice(0, 10)
  if (filters.from && day < filters.from) return false
  if (filters.to && day > filters.to) return false
  return true
}

function matches(movement: StockMovement, filters: StockLedgerFilters, warehouseName: string) {
  if (filters.kind !== "all" && movement.kind !== filters.kind) return false
  if (filters.warehouseId !== "all" && movement.warehouseId !== filters.warehouseId) return false
  if (!inDateRange(movement, filters)) return false
  const query = filters.query.trim().toLowerCase()
  if (!query) return true
  return [movement.sku, movement.ref, movement.reason, movement.id, warehouseName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query)
}

function Figure({ name, visual, className }: { name: string; visual: string; className?: string }) {
  return (
    <span data-slot="stock-figure" aria-label={name} style={numericStyle} className={cn("block tabular-nums text-end", className)}>
      <span className="sr-only">{name}</span>
      <span aria-hidden="true">{visual}</span>
    </span>
  )
}

function KindPill({ kind, labels }: { kind: StockMovementKind; labels: StockLedgerLabels }) {
  const Icon = kindIcon[kind]
  return (
    <StatusPill
      label={labels.kinds[kind]}
      tone={kindTone[kind]}
      dot={false}
      icon={<Icon className="size-3.5" aria-hidden="true" />}
    />
  )
}

export function StockLedger({
  movements,
  warehouses,
  sku,
  status = "ready",
  error,
  onRetry,
  filters: controlledFilters,
  onFiltersChange,
  locale = "es-MX",
  unit,
  labels: labelOverrides,
  className,
  classNames,
  onAdjust,
  onTransfer,
  highlightIds,
}: StockLedgerProps) {
  const labels = mergeLabels(locale, labelOverrides)
  const unitLabel = unit ?? labels.unit
  const wide = useMinWidth(640)
  const reduced = useReducedMotion() === true
  const headingId = React.useId()
  const [uncontrolled, setUncontrolled] = React.useState(emptyStockLedgerFilters)
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const filters = controlledFilters ?? uncontrolled
  const warehouseName = new Map(warehouses.map((item) => [item.id, item.label]))
  const nameFor = (id: string) => warehouseName.get(id) ?? id

  function updateFilters(next: StockLedgerFilters) {
    onFiltersChange?.(next)
    if (controlledFilters === undefined) setUncontrolled(next)
  }

  const scoped = sku ? movements.filter((movement) => movement.sku === sku) : movements
  const globalRows = runningBalances(scoped)
  const rows: LedgerRow[] = filters.balanceScope === "filter"
    ? runningBalances(scoped.filter((movement) => matches(movement, filters, nameFor(movement.warehouseId)))).map((row) => ({ id: row.movement.id, ...row }))
    : globalRows
        .filter((row) => matches(row.movement, filters, nameFor(row.movement.warehouseId)))
        .map((row) => ({ id: row.movement.id, ...row }))
  const period = movementTotals(scoped.filter((movement) => inDateRange(movement, filters)))
  let onHand = 0
  for (const value of balanceBy(scoped).values()) onHand += value

  const caption = sku ? labels.captionForSku(sku) : labels.caption
  const balanceHeader = filters.balanceScope === "filter" ? labels.balanceFiltered : labels.balanceGlobal
  const highlighted = new Set(highlightIds ?? [])

  const columns = [
      {
        id: "date",
        header: labels.date,
        enableSorting: false,
        cell: ({ row }: { row: { original: LedgerRow } }) => (
          <time dateTime={row.original.movement.at}>{formatMovementDate(row.original.movement.at, locale)}</time>
        ),
      },
      {
        id: "type",
        header: labels.type,
        enableSorting: false,
        cell: ({ row }: { row: { original: LedgerRow } }) => <KindPill kind={row.original.movement.kind} labels={labels} />,
      },
      {
        id: "reference",
        header: labels.reference,
        enableSorting: false,
        meta: { cellClassName: "whitespace-normal" },
        cell: ({ row }: { row: { original: LedgerRow } }) => (
          <div className="min-w-0">
            <p className="break-all">{row.original.movement.ref || labels.noReference}</p>
            {sku ? null : <p className="break-all text-muted-foreground">{row.original.movement.sku}</p>}
          </div>
        ),
      },
      {
        id: "warehouse",
        header: labels.warehouse,
        enableSorting: false,
        meta: { cellClassName: "whitespace-normal" },
        cell: ({ row }: { row: { original: LedgerRow } }) => (
          <span className="break-all">{nameFor(row.original.movement.warehouseId)}</span>
        ),
      },
      {
        id: "qty",
        header: labels.quantity,
        enableSorting: false,
        meta: { cellClassName: "text-end whitespace-normal", headClassName: "text-end" },
        cell: ({ row }: { row: { original: LedgerRow } }) => (
          <Figure
            name={quantityAccessibleName(row.original.movement.qty, unitLabel, locale)}
            visual={formatSignedQuantity(row.original.movement.qty, locale)}
            className={cn(row.original.movement.qty < 0 ? "text-destructive" : "text-foreground", classNames?.qty)}
          />
        ),
      },
      {
        id: "balance",
        header: balanceHeader,
        enableSorting: false,
        meta: { cellClassName: "text-end whitespace-normal", headClassName: "text-end" },
        cell: ({ row }: { row: { original: LedgerRow } }) => (
          <div className="flex flex-col items-end gap-1">
            <Figure
              name={
                row.original.negative
                  ? `${balanceAccessibleName(row.original.balance, unitLabel, locale)}, ${labels.negative}`
                  : balanceAccessibleName(row.original.balance, unitLabel, locale)
              }
              visual={formatBalance(row.original.balance, locale)}
              className={cn(row.original.negative ? "text-destructive" : "text-foreground", classNames?.balance)}
            />
            {row.original.negative ? <span className="text-xs text-destructive">{labels.negative}</span> : null}
          </div>
        ),
      },
  ]

  const logEntries = [...rows].reverse().map((row) => ({
    id: row.movement.id,
    time: row.movement.at,
    type: `stock:${row.movement.kind}`,
    message: `${formatSignedQuantity(row.movement.qty, locale)} · ${nameFor(row.movement.warehouseId)}`,
    payload: row.movement,
  }))

  const filterFields = (
    <FilterFields
      filters={filters}
      labels={labels}
      warehouses={warehouses}
      hideSkuSearch={Boolean(sku)}
      onChange={updateFilters}
    />
  )

  return (
    <section className={cn("flex min-w-0 max-w-full flex-col gap-4", className, classNames?.root)} aria-labelledby={headingId}>
      <div className={cn("flex min-w-0 flex-col gap-3", classNames?.header)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={headingId} className="min-w-0 break-all text-base font-medium">{caption}</h2>
          {status === "ready" && scoped.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {onAdjust ? (
                <Button type="button" className="h-11 min-h-11" onClick={onAdjust}>{labels.emptyAction}</Button>
              ) : null}
              {onTransfer ? (
                <Button type="button" variant="outline" className="h-11 min-h-11" onClick={onTransfer}>{labels.transferAction}</Button>
              ) : null}
            </div>
          ) : null}
        </div>
        {sku && status === "ready" ? (
          <StatStrip
            locale={locale}
            variant="panel"
            items={[
              { id: "on-hand", label: labels.onHand, value: onHand, format: "number" },
              { id: "in", label: labels.inbound, value: period.inbound, format: "number" },
              { id: "out", label: labels.outbound, value: period.outbound, format: "number" },
              { id: "net", label: labels.net, value: period.net, format: "number" },
            ]}
          />
        ) : null}
      </div>

      {status === "loading" ? (
        <div role="status" aria-busy="true" className="flex flex-col gap-2">
          <p>{labels.loading}</p>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : null}

      {status === "error" ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-xl bg-destructive/10 p-4">
          <p>{error || labels.errorTitle}</p>
          {onRetry ? (
            <Button type="button" className="h-11 min-h-11" onClick={onRetry}>{labels.retry}</Button>
          ) : null}
        </div>
      ) : null}

      {status === "ready" && scoped.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-muted p-4">
          <p>{labels.emptyTitle}</p>
          <Button type="button" className="h-11 min-h-11" onClick={onAdjust}>{labels.emptyAction}</Button>
        </div>
      ) : null}

      {status === "ready" && scoped.length > 0 && rows.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl bg-muted p-4">
          <p>{labels.filteredEmptyTitle}</p>
          <Button type="button" variant="outline" className="h-11 min-h-11" onClick={() => updateFilters(emptyStockLedgerFilters)}>
            {labels.clearFilters}
          </Button>
        </div>
      ) : null}

      {status === "ready" && rows.length > 0 ? (
        <>
          <div className={cn("flex flex-col gap-3", classNames?.toolbar)}>
            {wide ? filterFields : (
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <Button type="button" variant="outline" className="h-11 min-h-11 w-full" onClick={() => setFiltersOpen(true)}>
                  {labels.filters}
                </Button>
                <SheetContent side="bottom" showCloseButton={false} className={cn("h-dvh max-h-dvh overflow-y-auto rounded-none motion-reduce:animate-none", reduced && "animate-none duration-0")}>
                  <SheetHeader>
                    <SheetTitle>{labels.filters}</SheetTitle>
                    <SheetDescription className="sr-only">{labels.filters}</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 px-4 pb-4">
                    {filterFields}
                    <Button type="button" className="h-11 min-h-11" onClick={() => setFiltersOpen(false)}>{labels.closeFilters}</Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {wide ? null : <p className="text-sm text-muted-foreground">{balanceHeader}</p>}
            {wide ? (
              <AdminDataTable
                data={rows}
                columns={columns}
                caption={caption}
                selectable={false}
                showToolbar={false}
                tableClassName={cn("w-full table-fixed", classNames?.table)}
                rowClassName={(row) =>
                  cn(
                    row.negative && "bg-destructive/10",
                    highlighted.has(row.id) && !reduced && "bg-muted motion-safe:animate-in motion-safe:fade-in",
                    highlighted.has(row.id) && reduced && "bg-muted",
                  ) || undefined
                }
              />
            ) : (
              <ul className="flex min-w-0 flex-col gap-2">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    data-negative={row.negative ? "" : undefined}
                    data-highlight={highlighted.has(row.id) ? "" : undefined}
                    className={cn(
                      "flex min-w-0 flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10",
                      row.negative && "bg-destructive/10",
                      highlighted.has(row.id) && !reduced && "motion-safe:animate-in motion-safe:fade-in",
                      classNames?.card,
                    )}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col items-start gap-2">
                        <time className="text-sm text-muted-foreground" dateTime={row.movement.at}>
                          {formatMovementDate(row.movement.at, locale)}
                        </time>
                        <KindPill kind={row.movement.kind} labels={labels} />
                      </div>
                      <div className={cn("shrink-0", classNames?.qty)}>
                        <Figure
                          name={quantityAccessibleName(row.movement.qty, unitLabel, locale)}
                          visual={formatSignedQuantity(row.movement.qty, locale)}
                          className={row.movement.qty < 0 ? "text-destructive" : "text-foreground"}
                        />
                        <Figure
                          name={
                            row.negative
                              ? `${balanceAccessibleName(row.balance, unitLabel, locale)}, ${labels.negative}`
                              : balanceAccessibleName(row.balance, unitLabel, locale)
                          }
                          visual={formatBalance(row.balance, locale)}
                          className={cn("text-sm", row.negative ? "text-destructive" : "text-muted-foreground", classNames?.balance)}
                        />
                        {row.negative ? <p className="text-xs text-destructive">{labels.negative}</p> : null}
                      </div>
                    </div>
                    <p className="min-w-0 break-all text-sm">{row.movement.ref || labels.noReference}</p>
                    <p className="min-w-0 break-all text-sm text-muted-foreground">{nameFor(row.movement.warehouseId)}</p>
                    {sku ? null : <p className="min-w-0 break-all text-sm">{row.movement.sku}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-sm font-medium">{labels.logTitle}</h3>
            <EventLog entries={logEntries} />
          </div>
        </>
      ) : null}
    </section>
  )
}

function FilterFields({
  filters,
  labels,
  warehouses,
  hideSkuSearch,
  onChange,
}: {
  filters: StockLedgerFilters
  labels: StockLedgerLabels
  warehouses: readonly { id: string; label: string }[]
  hideSkuSearch: boolean
  onChange: (filters: StockLedgerFilters) => void
}) {
  const searchId = React.useId()
  const fromId = React.useId()
  const toId = React.useId()
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      {hideSkuSearch ? null : (
        <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <Label htmlFor={searchId}>{labels.search}</Label>
          <Input
            id={searchId}
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            className="h-11 min-h-11"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-2">
        <Label>{labels.kind}</Label>
        <Select value={filters.kind} onValueChange={(kind) => onChange({ ...filters, kind: kind as StockLedgerFilters["kind"] })}>
          <SelectTrigger className="h-11 w-full min-h-11" aria-label={labels.kind}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.allKinds}</SelectItem>
            {(Object.keys(labels.kinds) as StockMovementKind[]).map((kind) => (
              <SelectItem key={kind} value={kind}>{labels.kinds[kind]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <Label>{labels.warehouse}</Label>
        <Select value={filters.warehouseId} onValueChange={(warehouseId) => onChange({ ...filters, warehouseId })}>
          <SelectTrigger className="h-11 w-full min-h-11" aria-label={labels.warehouse}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{labels.allWarehouses}</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor={fromId}>{labels.from}</Label>
        <Input id={fromId} type="date" value={filters.from} onChange={(event) => onChange({ ...filters, from: event.target.value })} className="h-11 min-h-11" />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <Label htmlFor={toId}>{labels.to}</Label>
        <Input id={toId} type="date" value={filters.to} onChange={(event) => onChange({ ...filters, to: event.target.value })} className="h-11 min-h-11" />
      </div>
      <fieldset className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <legend className="text-sm font-medium">{labels.scope}</legend>
        <div className="flex flex-wrap gap-2">
          {(["global", "filter"] as const).map((scope) => (
            <label key={scope} className="inline-flex h-11 min-h-11 items-center gap-2 rounded-lg px-3 ring-1 ring-foreground/10">
              <input
                type="radio"
                name={labels.scope}
                checked={filters.balanceScope === scope}
                onChange={() => onChange({ ...filters, balanceScope: scope })}
              />
              {scope === "global" ? labels.scopeGlobal : labels.scopeFiltered}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
