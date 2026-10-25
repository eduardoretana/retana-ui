"use client"

import { DataTableMeter, DataTableReorder, DataTableSparkline, DataTableTrend, type DataTableReorderColumn } from "@/registry/ui/data-table-reorder"

import { manyRows, type DeskRow } from "../../portfolio-desk/data"

const token = "Y".repeat(60)

const columns: DataTableReorderColumn<DeskRow>[] = [
  { id: "name", header: "Pieza", sortValue: (row) => row.name, cell: (row) => row.name },
  { id: "hours", header: "Horas", align: "end", sortValue: (row) => row.hours, cell: (row) => row.hours },
  { id: "series", header: "Semana", sortable: false, cell: (row) => <DataTableSparkline values={row.series} label={row.name} /> },
  { id: "progress", header: "Avance", sortValue: (row) => row.progress, cell: (row) => <DataTableMeter value={row.progress} label={`${row.progress}%`} /> },
  { id: "trend", header: "Tendencia", sortValue: (row) => row.trend, cell: (row) => <DataTableTrend direction={row.trend} label={row.trendLabel} /> },
]

function row(overrides: Partial<DeskRow> & Pick<DeskRow, "id" | "name">): DeskRow {
  return {
    hours: 1,
    progress: 10,
    trend: "flat",
    trendLabel: "0",
    series: [1, 2, 1],
    owner: "Ana",
    note: "Nota",
    ...overrides,
  }
}

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tabla</h1>

      <section className="flex max-w-80 flex-col gap-2">
        <h2 className="text-sm font-medium">Vacío en 320px</h2>
        <DataTableReorder rows={[]} columns={columns} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Cargando</h2>
        <DataTableReorder rows={[]} columns={columns} loading />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Error</h2>
        <DataTableReorder rows={[]} columns={columns} error="Fallo de demostración." onRetry={() => undefined} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Una fila</h2>
        <DataTableReorder rows={[row({ id: "una", name: "Una" })]} columns={columns} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Token, emoji y números</h2>
        <DataTableReorder
          rows={[
            row({ id: "token", name: token, note: token, hours: 100000200000 }),
            row({ id: "emoji", name: "📦 Inventario 🙂", series: [] }),
            row({ id: "nums", name: "1.250,00", hours: 1250, progress: 100, trend: "up", trendLabel: "+12" }),
          ]}
          columns={columns}
        />
      </section>

      <section className="flex flex-col gap-2" dir="rtl">
        <h2 className="text-sm font-medium">Texto de derecha a izquierda</h2>
        <DataTableReorder rows={[row({ id: "rtl", name: "أرشيف تجريبي" })]} columns={columns} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Muchas filas y deshabilitada</h2>
        <DataTableReorder rows={manyRows(40)} columns={columns} disabled className="max-h-80" />
      </section>

      <section className="flex min-w-0 gap-3">
        <h2 className="sr-only">Apretada por un hermano</h2>
        <div className="h-40 w-40 shrink-0 rounded-lg border border-border" />
        <div className="min-w-0 flex-1">
          <DataTableReorder rows={[row({ id: "side", name: "Al lado" })]} columns={columns.slice(0, 2)} />
        </div>
      </section>
    </main>
  )
}
