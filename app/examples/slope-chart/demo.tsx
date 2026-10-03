"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { SlopeChart, type SlopeItem } from "@/registry/ui/slope-chart"

const orders: SlopeItem[] = [
  { key: "gallery", label: "Galería", start: 18, end: 27 },
  { key: "wholesale", label: "Mayoreo", start: 32, end: 21 },
  { key: "workshop", label: "Taller", start: 14, end: 19 },
  { key: "repair", label: "Reparación", start: 9, end: 9 },
]

const crowd: SlopeItem[] = people.map((person, index) => ({
  key: person.id,
  label: person.name,
  start: 8 + index,
  end: 16 - index,
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <SlopeChart data={orders} label="Pedidos del taller" startLabel="Antes" endLabel="Después" highlightKey="gallery" />
      <StressCases
        empty={<SlopeChart data={[]} label="Sin pedidos" startLabel="Antes" endLabel="Después" emptyLabel="Sin datos" />}
        long={<SlopeChart data={[{ key: "long", label: unbreakable, start: 4, end: 11 }]} label={unbreakable} startLabel="Antes" endLabel="Después" />}
        crowded={<SlopeChart data={crowd} label="Diez bancos" startLabel="Antes" endLabel="Después" />}
      />
    </div>
  )
}
