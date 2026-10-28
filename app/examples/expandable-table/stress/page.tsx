"use client"

import { StressCase } from "@/app/examples/stress-case"
import { ExpandableTable, ExpansionChecklist } from "@/registry/ui/expandable-table"

const token = "N".repeat(60)

type StressRow = { id: string; code: string; account: string }

const columns = [
  { id: "code", header: "Pedido", cell: (row: StressRow) => row.code },
  { id: "account", header: "Cuenta", cell: (row: StressRow) => row.account },
]

export default function StressPage() {
  const long = { id: "long", code: token, account: token, status: "open" as const }
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Tabla expansible</h1>
      <StressCase label="Vacío">
        <ExpandableTable<StressRow> rows={[]} columns={columns} rowTitle={(row) => row.code} />
      </StressCase>
      <StressCase label="Carga y error">
        <ExpandableTable<StressRow> rows={[]} columns={columns} rowTitle={(row) => row.code} loading />
        <ExpandableTable<StressRow> rows={[long]} columns={columns} rowTitle={(row) => row.code} error="No se pudo abrir." />
      </StressCase>
      <StressCase label="320px" width={320}>
        <ExpandableTable<StressRow>
          rows={[long]}
          columns={columns}
          rowTitle={(row) => row.code}
          defaultExpanded={{ long: true }}
          renderDetail={() => (
            <ExpansionChecklist
              label="Tareas"
              items={[{ id: "a", title: token, status: "Tarde", owner: token, date: "30 oct", comment: token }]}
            />
          )}
        />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <ExpandableTable<StressRow>
            rows={[{ id: "rtl", code: "طلب", account: "ورشة" }]}
            columns={columns}
            rowTitle={(row) => row.code}
          />
        </div>
      </StressCase>
      <StressCase label="Diez filas">
        <ExpandableTable<StressRow>
          rows={Array.from({ length: 10 }, (_, index) => ({
            id: `r${index}`,
            code: `PED-${index}`,
            account: "Cerámica del Bajío",
            status: "open" as const,
          }))}
          columns={columns}
          rowTitle={(row) => row.code}
          pageSize={4}
        />
      </StressCase>
    </main>
  )
}
