"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { ComparisonTable, type ComparisonColumn, type ComparisonSection } from "@/registry/blocks/comparison-table"

const columns: ComparisonColumn[] = [
  { id: "atelier", name: atelier.name, caption: atelier.city, highlight: true },
  { id: "studio", name: plans[0].name, caption: `$${plans[0].price}` },
  { id: "workshop", name: plans[1].name, caption: `$${plans[1].price}` },
  { id: "house", name: plans[2].name, caption: `$${plans[2].price}` },
]

const sections: ComparisonSection[] = [
  {
    id: "taller",
    title: "Taller",
    rows: [
      { id: "kiln", feature: "Hornos", values: { atelier: "Todos", studio: "Uno", workshop: "Tres", house: "Todos" } },
      { id: "glaze", feature: "Vidrio compartido", values: { atelier: true, studio: false, workshop: true, house: true } },
      { id: "guest", feature: "Invitados", hint: "Quien visita el horno", values: { atelier: true, studio: { value: "partial", note: "Dos visitas" }, workshop: true, house: true } },
    ],
  },
  {
    id: "envio",
    title: "Envío",
    rows: [
      { id: "pack", feature: "Embalaje", values: { atelier: true, studio: false, workshop: true, house: true } },
      { id: "export", feature: "Exportación", values: { atelier: true, studio: false, workshop: false, house: { value: "partial", note: "Con aviso" } } },
    ],
  },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <ComparisonTable
        title={`Planes de ${atelier.name}`}
        description={`${atelier.kiln}. Lo que incluye cada banco del taller.`}
        columns={columns}
        sections={sections}
        differencesLabel="Solo las diferencias"
        cta={{ label: "Reservar un banco", doneLabel: "Reserva lista" }}
      />
      <StressCases
        empty={<ComparisonTable title="Comparar" description="" columns={[]} sections={[]} differencesLabel="Solo las diferencias" />}
        long={
          <ComparisonTable
            title={unbreakable}
            columns={[{ id: "a", name: unbreakable, highlight: true }, { id: "b", name: "Otro" }]}
            sections={[{ id: "s", title: "Taller", rows: [{ id: "r", feature: unbreakable, values: { a: true, b: false } }] }]}
            stackBelow={10000}
          />
        }
        crowded={
          <ComparisonTable
            title="Diez filas"
            columns={columns.slice(0, 2)}
            sections={[{ id: "s", title: "Taller", rows: Array.from({ length: 10 }, (_, index) => ({ id: `r-${index}`, feature: `Fila ${index + 1}`, values: { atelier: true, studio: index % 2 === 0 } })) }]}
            stackBelow={10000}
          />
        }
      />
    </div>
  )
}
