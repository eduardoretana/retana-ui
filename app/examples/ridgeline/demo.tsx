"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { Ridgeline, type RidgelineSeries } from "@/registry/ui/ridgeline"

const months: RidgelineSeries[] = [
  { id: "mar", label: "Mar", values: [18, 19, 21, 22, 20, 24, 19] },
  { id: "apr", label: "Abr", values: [21, 23, 24, 26, 25, 22, 27] },
  { id: "may", label: "May", values: [24, 26, 28, 27, 30, 29, 25] },
  { id: "jun", label: "Jun", values: [28, 31, 30, 33, 32, 29, 34] },
]

const crowd: RidgelineSeries[] = people.map((person, index) => ({
  id: person.id,
  label: person.name,
  values: [16 + index, 18 + index, 21, 19 + (index % 4), 24, 22 + (index % 3)],
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <Ridgeline series={months} label="Máximas del horno" unit="°C" />
      <StressCases
        empty={<Ridgeline series={[]} label="Sin lecturas" emptyLabel="Sin datos" />}
        long={<Ridgeline series={[{ id: "long", label: unbreakable, values: months[0].values }]} label={unbreakable} unit="°C" />}
        crowded={<Ridgeline series={crowd} label="Diez meses" unit="°C" rowHeight={26} />}
      />
    </div>
  )
}
