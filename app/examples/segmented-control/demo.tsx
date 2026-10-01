"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { facetTags, unbreakable } from "@/app/examples/arc/demo-data"
import { SegmentedControl } from "@/registry/ui/segmented-control"

const ranges = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
]

export function Demo() {
  const [range, setRange] = useState("month")
  const [tag, setTag] = useState(facetTags[0])
  return (
    <div className="flex flex-col gap-8">
      <SegmentedControl label="Rango" options={ranges} value={range} onValueChange={setRange} />
      <p className="text-sm text-muted-foreground">Pedidos de Costa Atelier en {ranges.find((item) => item.value === range)?.label}.</p>
      <StressCases
        empty={<SegmentedControl label="Vacío" options={[]} value="" />}
        long={
          <SegmentedControl
            label="Largo"
            options={[
              { value: "a", label: unbreakable },
              { value: "b", label: "Corto" },
            ]}
            defaultValue="a"
          />
        }
        crowded={<SegmentedControl label="Diez" options={facetTags.map((item) => ({ value: item, label: item }))} value={tag} onValueChange={setTag} />}
      />
    </div>
  )
}
