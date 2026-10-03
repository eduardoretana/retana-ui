"use client"

import { Circle } from "lucide-react"

import { StressCase } from "@/app/examples/stress-case"
import { AdaptiveTable, type AdaptiveColumn, type AdaptiveGroup } from "@/registry/ui/adaptive-table"

type Row = { id: string; name: string; amount: string; note: string }

const columns: AdaptiveColumn<Row>[] = [
  {
    id: "name",
    priority: 3,
    minWidth: 160,
    header: { icon: <Circle />, label: "Name" },
    render: (row) => row.name,
    textValue: (row) => row.name,
  },
  {
    id: "amount",
    priority: 2,
    minWidth: 90,
    mergeInto: "name",
    align: "end",
    header: { icon: <Circle />, label: "Amount" },
    render: (row) => <span className="tabular-nums">{row.amount}</span>,
    compactRender: (row) => row.amount,
    textValue: (row) => row.amount,
  },
  {
    id: "note",
    priority: 1,
    minWidth: 120,
    header: { icon: <Circle />, label: "Note" },
    render: (row) => row.note,
  },
]

function group(id: string, label: string, rows: Row[]): AdaptiveGroup<Row> {
  return { id, label, icon: <Circle />, rows }
}

const one = group("one", "Uno", [{ id: "1", name: "Pebble", amount: "$10", note: "Nota" }])
const sentences = "El acuerdo sigue abierto porque el cliente pidió otra revisión del alcance."
const unbroken = "A".repeat(60)
const realistic = group("real", "Scoping", [
  { id: "a", name: "Pebble Co", amount: "$1,800", note: "Marzo" },
  { id: "b", name: "Marlowe Studio", amount: "$640", note: "Abril" },
  { id: "c", name: "Kindred Supply", amount: "$9,200", note: "Mayo" },
])
const many = group(
  "many",
  "Lista",
  Array.from({ length: 40 }, (_, index) => ({
    id: String(index),
    name: `Cuenta ${index + 1}`,
    amount: `$${index * 10}`,
    note: "Nota",
  })),
)

function Table({
  groups,
  title = "Pipeline",
  loading = false,
}: {
  groups: AdaptiveGroup<Row>[]
  title?: string
  loading?: boolean
}) {
  return (
    <AdaptiveTable
      title={title}
      columns={columns}
      groups={groups}
      getRowId={(row) => row.id}
      loading={loading}
      emptyState="Sin filas"
      collapsibleGroups
    />
  )
}

export default function AdaptiveTableStressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · tabla adaptativa</h1>
      <StressCase label="Vacío">
        <Table groups={[]} />
      </StressCase>
      <StressCase label="Una palabra" width={480}>
        <Table groups={[group("w", "Uno", [{ id: "w", name: "Pebble", amount: "$1", note: "Ok" }])]} />
      </StressCase>
      <StressCase label="Varias frases" width={480}>
        <Table groups={[group("s", sentences, [{ id: "s", name: sentences, amount: "$1,200", note: sentences }])]} />
      </StressCase>
      <StressCase label="Cadena de 60 caracteres" width={480}>
        <Table groups={[group("u", unbroken, [{ id: "u", name: unbroken, amount: "$999", note: unbroken }])]} />
      </StressCase>
      <StressCase label="Emoji" width={480}>
        <Table groups={[group("e", "🚀", [{ id: "e", name: "🚀 Lanzamiento", amount: "$20", note: "✨" }])]} />
      </StressCase>
      <StressCase label="Texto de derecha a izquierda" width={480}>
        <div dir="rtl">
          <Table groups={[group("r", "مرحبا", [{ id: "r", name: "مرحبا بالفريق", amount: "١٢", note: "ملاحظة" }])]} />
        </div>
      </StressCase>
      <StressCase label="Números alineados" width={480}>
        <Table
          groups={[
            group("n", "Importes", [
              { id: "n1", name: "Pebble", amount: "$10", note: "1" },
              { id: "n2", name: "Kindred", amount: "$12,800", note: "2" },
            ]),
          ]}
        />
      </StressCase>
      <StressCase label="Cantidad 0">
        <Table groups={[group("z", "Vacío", [])]} />
      </StressCase>
      <StressCase label="Cantidad 1" width={480}>
        <Table groups={[one]} />
      </StressCase>
      <StressCase label="Realista" width={480}>
        <Table groups={[realistic]} />
      </StressCase>
      <StressCase label="10× filas" width={480}>
        <Table groups={[many]} />
      </StressCase>
      <StressCase label="Contenedor 320px" width={320}>
        <Table groups={[realistic]} />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex w-80 gap-2">
          <div className="w-24 shrink-0 bg-muted p-2 text-sm">Hermano</div>
          <div className="min-w-0 flex-1">
            <Table groups={[realistic]} />
          </div>
        </div>
      </StressCase>
      <StressCase label="Muy ancho" width={1100}>
        <Table groups={[realistic]} />
      </StressCase>
      <StressCase label="Cargando" width={480}>
        <Table groups={[realistic]} loading />
      </StressCase>
    </main>
  )
}
