"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { WaffleChart, type WaffleCategory } from "@/registry/ui/waffle-chart"

const mix: WaffleCategory[] = [
  { key: "bisque", label: "Bizcocho", value: 42 },
  { key: "glaze", label: "Esmalte", value: 28 },
  { key: "repair", label: "Reparación", value: 18 },
  { key: "loss", label: "Merma", value: 12 },
]

const crowd: WaffleCategory[] = people.map((person, index) => ({
  key: person.id,
  label: person.name,
  value: 10 - index || 1,
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <WaffleChart data={mix} label="Piezas del horno" unit="pzas" />
      <StressCases
        empty={<WaffleChart data={[]} label="Sin piezas" emptyLabel="Sin datos" />}
        long={<WaffleChart data={[{ key: "long", label: unbreakable, value: 70 }, { key: "rest", label: "Resto", value: 30 }]} label={unbreakable} />}
        crowded={<WaffleChart data={crowd} label="Diez bancos" />}
      />
    </div>
  )
}
