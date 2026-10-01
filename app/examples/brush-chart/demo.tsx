"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { BrushChart } from "@/registry/ui/brush-chart"

const DAY = 86_400_000
const start = Date.UTC(2026, 8, 1)

const history = Array.from({ length: 48 }, (_, index) => ({
  date: start + index * DAY,
  value: 12 + Math.round(8 * Math.sin(index / 5) + (index % 4)),
}))

const ten = Array.from({ length: 10 }, (_, index) => ({
  date: start + index * DAY,
  value: 6 + index,
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <BrushChart
        data={history}
        label={`Piezas · ${atelier.name}`}
        unit="pzas"
        defaultRange={[start + 14 * DAY, start + 28 * DAY]}
        annotations={[{ date: start + 20 * DAY, label: "Galería", description: atelier.city }]}
      />
      <StressCases
        empty={<BrushChart data={[]} label="Sin piezas" emptyLabel="Todavía no hay datos" />}
        long={<BrushChart data={history.slice(0, 16)} label={unbreakable} annotations={[{ date: start, label: unbreakable }]} height={160} />}
        crowded={<BrushChart data={ten} label="Diez días" height={140} overviewHeight={40} minSpan={DAY} />}
      />
    </div>
  )
}
