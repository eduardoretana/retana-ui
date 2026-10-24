"use client"

import { StressCase } from "@/app/examples/stress-case"
import { DataTableGrouping, type DataTableGroupingColumn } from "@/registry/ui/data-table-grouping"

type Row = { id: string; name: string; note: string; amount: number; children?: Row[] }

const columns: DataTableGroupingColumn<Row>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "note", header: "Nota" },
  {
    accessorKey: "amount",
    header: "Importe",
    cell: ({ getValue }) => <span className="tabular-nums">{String(getValue() ?? "")}</span>,
  },
]

const sentences = "El acuerdo sigue abierto porque el cliente pidió otra revisión del alcance."
const unbroken = "A".repeat(60)

function row(id: string, name: string, note: string, amount = 10): Row {
  return { id, name, note, amount }
}

function Table({
  data,
  loading = false,
  error,
}: {
  data: Row[]
  loading?: boolean
  error?: string
}) {
  return (
    <DataTableGrouping
      data={data}
      columns={columns}
      getRowId={(item) => item.id}
      getRowLabel={(item) => item.name}
      getSubRows={(item) => item.children}
      aggregates={{ amount: "sum" }}
      align={{ amount: "end" }}
      loading={loading}
      error={error}
      defaultPageSize={50}
      groupCriteria={[
        { id: "note", label: "Nota", columnId: "note" },
        { id: "none", label: "Ninguno", columnId: null },
      ]}
      defaultGroupBy="none"
      labels={{ emptyTitle: "Sin filas", loading: "Cargando", errorTitle: "Error", grandTotal: "Total" }}
    />
  )
}

const realistic: Row[] = [
  row("a", "Pebble", "Marzo", 1800),
  row("b", "Marlowe", "Abril", 640),
  row("c", "Kindred", "Mayo", 9200),
]

const many: Row[] = Array.from({ length: 40 }, (_, index) => row(`m${index}`, `Cuenta ${index + 1}`, "Nota", index * 10))

export default function DataTableGroupingStressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · tabla con agrupación</h1>
      <StressCase label="Vacío">
        <Table data={[]} />
      </StressCase>
      <StressCase label="Una palabra" width={480}>
        <Table data={[row("w", "Pebble", "Ok", 1)]} />
      </StressCase>
      <StressCase label="Varias frases" width={480}>
        <Table data={[row("s", sentences, sentences, 1200)]} />
      </StressCase>
      <StressCase label="Cadena de 60 caracteres" width={480}>
        <Table data={[row("u", unbroken, unbroken, 999)]} />
      </StressCase>
      <StressCase label="Emoji" width={480}>
        <Table data={[row("e", "🚀 Lanzamiento", "✨", 20)]} />
      </StressCase>
      <StressCase label="Texto de derecha a izquierda" width={480}>
        <div dir="rtl">
          <Table data={[row("r", "مرحبا بالفريق", "ملاحظة", 12)]} />
        </div>
      </StressCase>
      <StressCase label="Números alineados" width={480}>
        <Table
          data={[
            row("n1", "Pebble", "1", 10),
            row("n2", "Kindred", "2", 12800),
          ]}
        />
      </StressCase>
      <StressCase label="Cantidad 0">
        <Table data={[]} />
      </StressCase>
      <StressCase label="Cantidad 1" width={480}>
        <Table data={[row("one", "Pebble", "Nota", 10)]} />
      </StressCase>
      <StressCase label="Realista" width={480}>
        <Table data={realistic} />
      </StressCase>
      <StressCase label="10× filas" width={480}>
        <Table data={many} />
      </StressCase>
      <StressCase label="Árbol anidado" width={480}>
        <Table
          data={[
            {
              id: "parent",
              name: "Casa",
              note: "Grupo",
              amount: 0,
              children: [row("c1", "Renta", "Hijo", 100), row("c2", "Luz", "Hijo", 40)],
            },
          ]}
        />
      </StressCase>
      <StressCase label="Contenedor 320px" width={320}>
        <Table data={realistic} />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex w-80 gap-2">
          <div className="w-24 shrink-0 bg-muted p-2 text-sm">Hermano</div>
          <div className="min-w-0 flex-1">
            <Table data={realistic} />
          </div>
        </div>
      </StressCase>
      <StressCase label="Muy ancho">
        <Table data={realistic} />
      </StressCase>
      <StressCase label="Carga" width={480}>
        <Table data={realistic} loading />
      </StressCase>
      <StressCase label="Error" width={480}>
        <Table data={realistic} error="No hay señal" />
      </StressCase>
    </main>
  )
}
