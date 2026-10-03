"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { Treemap, type TreemapNode } from "@/registry/ui/treemap"

const revenue: TreemapNode = {
  id: "costa",
  label: "Costa",
  children: [
    {
      id: "clay",
      label: "Arcilla",
      children: [
        { id: "stone", label: "Gres", value: 42, color: 0.12 },
        { id: "porc", label: "Porcelana", value: 28, color: 0.04 },
        { id: "terra", label: "Terracota", value: 18, color: -0.02 },
      ],
    },
    {
      id: "glaze",
      label: "Esmalte",
      children: [
        { id: "matte", label: "Mate", value: 16, color: 0.08 },
        { id: "clear", label: "Transparente", value: 11, color: 0.01 },
      ],
    },
    { id: "repair", label: "Reparación", value: 9, color: -0.06 },
  ],
}

const crowd: TreemapNode = {
  id: "taller",
  label: "Taller",
  children: people.map((person, index) => ({ id: person.id, label: person.name, value: 12 - index })),
}

const longTree: TreemapNode = {
  id: "long",
  label: unbreakable,
  children: [
    { id: "a", label: unbreakable, value: 8 },
    { id: "b", label: "Gres", value: 5 },
  ],
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <Treemap data={revenue} label="Ingresos del taller" colorLabel="Cambio" formatColor={(value) => `${Math.round(value * 100)}%`} height={360} />
      <StressCases
        empty={<Treemap data={{ id: "empty", label: "Vacío" }} label="Sin piezas" emptyLabel="Sin datos" height={180} />}
        long={<Treemap data={longTree} label={unbreakable} height={180} />}
        crowded={<Treemap data={crowd} label="Diez bancos" height={280} />}
      />
    </div>
  )
}
