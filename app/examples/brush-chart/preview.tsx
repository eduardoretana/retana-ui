"use client"

import { BrushChart } from "@/registry/ui/brush-chart"

const DAY = 86_400_000
const start = Date.UTC(2026, 8, 1)

export default function BrushChartPreview() {
  return (
    <div className="flex h-full min-w-0 items-center bg-background p-3">
      <BrushChart
        className="w-full"
        height={108}
        overviewHeight={36}
        label="Piezas"
        defaultRange={[start + 8 * DAY, start + 18 * DAY]}
        data={Array.from({ length: 28 }, (_, index) => ({
          date: start + index * DAY,
          value: 10 + (index % 6),
        }))}
      />
    </div>
  )
}
