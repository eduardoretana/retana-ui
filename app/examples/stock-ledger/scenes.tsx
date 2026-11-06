"use client"

import { useState } from "react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { balanceKey, type MovementIssue, type StockMovement } from "@/registry/lib/stock-ledger"
import { StockLedger, emptyStockLedgerFilters } from "@/registry/ui/stock-ledger"
import { StockMovementDialog } from "@/registry/ui/stock-movement-dialog"

import {
  insufficientIssue,
  movements,
  negativeMovements,
  postedMovement,
  reasonIssue,
  reasons,
  sameWarehouseIssue,
  skus,
  warehouses,
  zeroIssue,
} from "./fixtures"

const ledgerFrame = { size: "desk" as const, surface: "card" as const, padding: "md" as const }
const dialogFrame = { size: "lg" as const, surface: "canvas" as const, padding: "md" as const }

function localeOf(locale: SceneRenderProps["locale"]) {
  return locale === "en" ? "en-US" : "es-MX"
}

function LedgerScene({
  locale,
  log,
  status = "ready",
  rows = movements,
  sku,
  filters,
  error,
  highlightIds,
}: SceneRenderProps & {
  status?: "ready" | "loading" | "error"
  rows?: StockMovement[]
  sku?: string
  filters?: typeof emptyStockLedgerFilters
  error?: string
  highlightIds?: string[]
}) {
  const [open, setOpen] = useState<"adjust" | "transfer" | null>(null)
  const [items, setItems] = useState(rows)
  const language = locale === "en" ? "en" : "es"
  return (
    <>
      <StockLedger
        movements={status === "ready" ? items : rows}
        warehouses={warehouses(language)}
        sku={sku}
        status={status}
        error={error}
        filters={filters}
        locale={localeOf(locale)}
        highlightIds={highlightIds}
        onRetry={() => log(formatSceneCall("onRetry"))}
        onAdjust={() => {
          log(formatSceneCall("onAdjust"))
          setOpen("adjust")
        }}
        onTransfer={() => {
          log(formatSceneCall("onTransfer"))
          setOpen("transfer")
        }}
      />
      <StockMovementDialog
        open={open != null}
        onOpenChange={(next) => { if (!next) setOpen(null) }}
        mode={open ?? "adjust"}
        skus={skus}
        warehouses={warehouses(language)}
        balances={new Map([[balanceKey("SKU-0001", "norte"), 28], [balanceKey("SKU-0001", "sur"), 10]])}
        reasons={reasons(language)}
        locale={localeOf(locale)}
        onSubmit={async (posted) => {
          log(formatSceneCall("onSubmit", [posted.map((movement) => movement.kind)]))
          setItems((current) => [...current, ...posted])
        }}
      />
    </>
  )
}

function DialogScene({
  locale,
  mode,
  issues,
  busy,
  externalError,
  defaultValues,
}: SceneRenderProps & {
  mode: "adjust" | "transfer"
  issues?: readonly MovementIssue[]
  busy?: boolean
  externalError?: string
  defaultValues?: { sku: string; warehouseId: string; destinationWarehouseId?: string; qty: number; reason?: string }
}) {
  const language = locale === "en" ? "en" : "es"
  const [open, setOpen] = useState(true)
  return (
    <StockMovementDialog
      open={open}
      onOpenChange={setOpen}
      mode={mode}
      skus={skus}
      warehouses={warehouses(language)}
      balances={new Map([[balanceKey("SKU-0001", "norte"), 5]])}
      reasons={reasons(language)}
      locale={localeOf(locale)}
      issues={issues}
      busy={busy}
      externalError={externalError}
      defaultValues={defaultValues}
      onSubmit={async () => { setOpen(false) }}
    />
  )
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame: ledgerFrame, render: (props) => <LedgerScene {...props} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame: ledgerFrame, render: (props) => <LedgerScene {...props} rows={[]} /> },
  { id: "filtered-empty", label: "Sin coincidencias", labelEn: "No matches", frame: ledgerFrame, render: (props) => <LedgerScene {...props} filters={{ ...emptyStockLedgerFilters, query: "no-existe" }} /> },
  { id: "loading", label: "Cargando", labelEn: "Loading", frame: ledgerFrame, render: (props) => <LedgerScene {...props} status="loading" /> },
  { id: "error", label: "Error", labelEn: "Error", frame: ledgerFrame, render: (props) => <LedgerScene {...props} status="error" error={props.locale === "en" ? "The ledger could not be read" : "No se pudo leer el libro"} /> },
  { id: "negative", label: "Saldo negativo", labelEn: "Negative balance", frame: ledgerFrame, render: (props) => <LedgerScene {...props} rows={negativeMovements} /> },
  { id: "product", label: "Un SKU", labelEn: "One SKU", frame: ledgerFrame, render: (props) => <LedgerScene {...props} sku="SKU-0001" /> },
  { id: "adjust", label: "Ajuste", labelEn: "Adjustment", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="adjust" defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 4, reason: "count" }} /> },
  { id: "transfer", label: "Transferencia", labelEn: "Transfer", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="transfer" defaultValues={{ sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "sur", qty: 3, reason: "count" }} /> },
  { id: "invalid", label: "Inválido", labelEn: "Invalid", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="adjust" issues={[zeroIssue, reasonIssue]} defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 0 }} /> },
  { id: "insufficient", label: "Sin existencia", labelEn: "Not enough stock", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="adjust" issues={[insufficientIssue]} defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: -9, reason: "count" }} /> },
  { id: "same-warehouse", label: "Mismo almacén", labelEn: "Same warehouse", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="transfer" issues={[sameWarehouseIssue]} defaultValues={{ sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "norte", qty: 2 }} /> },
  { id: "submitting", label: "Guardando", labelEn: "Saving", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="adjust" busy defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 1, reason: "count" }} /> },
  { id: "submit-error", label: "Error al guardar", labelEn: "Save failed", frame: dialogFrame, render: (props) => <DialogScene {...props} mode="transfer" externalError={props.locale === "en" ? "The transfer could not be saved" : "No se pudo guardar la transferencia"} defaultValues={{ sku: "SKU-0001", warehouseId: "norte", destinationWarehouseId: "sur", qty: 2, reason: "count" }} /> },
  { id: "success", label: "Listo", labelEn: "Saved", frame: ledgerFrame, render: (props) => <LedgerScene {...props} rows={[...negativeMovements, postedMovement]} highlightIds={[postedMovement.id]} /> },
]
