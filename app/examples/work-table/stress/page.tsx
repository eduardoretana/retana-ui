"use client"

import { StressCase } from "@/app/examples/stress-case"
import { WorkTable, type WorkColumn } from "@/registry/ui/work-table"

type Row = { id: string; title: string }

const long = "A".repeat(60)
const columns: WorkColumn<Row>[] = [
  { id: "title", header: "Título", cell: (row) => <span className="block max-w-full truncate">{row.title}</span> },
]

const one: Row[] = [{ id: "1", title: "Horno" }]
const many: Row[] = Array.from({ length: 12 }, (_, index) => ({ id: String(index), title: `Fila ${index + 1}` }))

export default function WorkTableStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tabla de trabajo</h1>
      <StressCase label="Vacío">
        <WorkTable rows={[]} columns={columns} paginate={false} />
      </StressCase>
      <StressCase label="Cargando">
        <WorkTable rows={one} columns={columns} state="loading" paginate={false} />
      </StressCase>
      <StressCase label="Error">
        <WorkTable rows={one} columns={columns} state="error" errorMessage="Sin red" onRetry={() => {}} paginate={false} />
      </StressCase>
      <StressCase label="Una palabra, 60 caracteres, emoji y RTL" width={320}>
        <WorkTable
          rows={[
            { id: "a", title: "Horno" },
            { id: "b", title: long },
            { id: "c", title: "🔥 revisión" },
            { id: "d", title: "مرحبا بالجدول" },
          ]}
          columns={columns}
          paginate={false}
        />
      </StressCase>
      <StressCase label="Doce filas en 320px" width={320}>
        <WorkTable rows={many} columns={columns} pageSize={5} />
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <WorkTable rows={many.slice(0, 4)} columns={columns} paginate={false} />
        </div>
      </StressCase>
    </main>
  )
}
