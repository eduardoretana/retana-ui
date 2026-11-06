"use client"

import { useSyncExternalStore } from "react"

import { StressCase } from "@/app/examples/stress-case"
import { balanceBy, runningBalances, type StockMovement } from "@/registry/lib/stock-ledger"
import { StockLedger } from "@/registry/ui/stock-ledger"
import { StockMovementDialog } from "@/registry/ui/stock-movement-dialog"

import { longReason, longSku, movements, skus, warehouses } from "../fixtures"

const warehousesEs = warehouses("es")

function timedLedger() {
  const rows: StockMovement[] = Array.from({ length: 5000 }, (_, index) => ({
    id: String(index).padStart(5, "0"),
    at: new Date(Date.UTC(2020, 0, 1) + index * 1000).toISOString(),
    sku: `SKU-${String(index % 50).padStart(4, "0")}`,
    warehouseId: Math.floor(index / 50) % 2 === 0 ? "norte" : "sur",
    kind: "in",
    qty: 1,
  }))
  const start = performance.now()
  runningBalances(rows)
  balanceBy(rows)
  return performance.now() - start
}

const heavy: StockMovement = {
  id: "heavy",
  at: "2026-06-01T12:00:00.000Z",
  sku: longSku,
  warehouseId: "norte",
  kind: "adjust",
  qty: 9_999_999,
  reason: longReason,
  ref: "REF-" + "B".repeat(60),
}

let cachedElapsed: number | null = null

function elapsedSnapshot() {
  cachedElapsed ??= timedLedger()
  return cachedElapsed
}

export default function StressPage() {
  const elapsed = useSyncExternalStore(() => () => {}, elapsedSnapshot, () => null)
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Libro de inventario</h1>
      <StressCase label={elapsed == null ? "5 000 movimientos" : `5 000 movimientos · ${elapsed.toFixed(1)} ms`}>
        <p className="text-sm text-muted-foreground">
          {elapsed == null
            ? "Calculando el saldo de 5 000 movimientos."
            : `El cálculo del saldo para 5 000 movimientos tardó ${elapsed.toFixed(1)} ms en este navegador.`}
        </p>
      </StressCase>
      <StressCase label="Vacío">
        <StockLedger movements={[]} warehouses={warehousesEs} onAdjust={() => {}} />
      </StressCase>
      <StressCase label="Una fila">
        <StockLedger movements={[movements[0]!]} warehouses={warehousesEs} />
      </StressCase>
      <StressCase label="SKU de 80 caracteres, cantidad grande y motivo largo" width={390}>
        <StockLedger movements={[heavy]} warehouses={warehousesEs} />
      </StressCase>
      <StressCase label="390px" width={390}>
        <StockLedger movements={movements} warehouses={warehousesEs} sku="SKU-0001" />
      </StressCase>
      <StressCase label="320px" width={320}>
        <StockLedger movements={movements} warehouses={warehousesEs} />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <StockLedger movements={movements.slice(0, 2)} warehouses={warehousesEs} />
        </div>
      </StressCase>
      <StressCase label="en-US">
        <StockLedger movements={movements} warehouses={warehouses("en")} locale="en-US" sku="SKU-0001" />
      </StressCase>
      <StressCase label="Cargando y error">
        <StockLedger movements={movements} warehouses={warehousesEs} status="loading" />
        <StockLedger movements={movements} warehouses={warehousesEs} status="error" error={longReason} onRetry={() => {}} />
      </StressCase>
      <StressCase label="Diálogo de ajuste" width={390}>
        <StockMovementDialog
          open
          onOpenChange={() => {}}
          mode="adjust"
          skus={skus}
          warehouses={warehousesEs}
          balances={new Map([["SKU-0001\u0000norte", 28]])}
          reasons={[{ id: "count", label: "Conteo" }]}
          defaultValues={{ sku: "SKU-0001", warehouseId: "norte", qty: 4, reason: "count" }}
          onSubmit={async () => {}}
        />
      </StressCase>
    </main>
  )
}
