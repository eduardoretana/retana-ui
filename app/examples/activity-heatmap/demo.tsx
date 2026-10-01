"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { ActivityHeatmap, type ActivityDay } from "@/registry/ui/activity-heatmap"

function yearOf(seed: number): ActivityDay[] {
  const start = Date.parse("2026-01-01T00:00:00Z")
  return Array.from({ length: 120 }, (_, index) => ({
    date: new Date(start + index * 86_400_000).toISOString().slice(0, 10),
    count: (index * seed) % 7 === 0 ? 0 : (index * seed) % 5,
  }))
}

export function Demo() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-8">
      <ActivityHeatmap days={yearOf(3)} label="Hornos encendidos" period="este trimestre" selectedDate={selected} onSelectDate={setSelected} />
      <StressCases
        empty={<ActivityHeatmap days={[]} label="Sin días" period="este año" />}
        long={<ActivityHeatmap days={yearOf(2)} label={unbreakable} period={unbreakable} />}
        crowded={<ActivityHeatmap days={yearOf(5)} label="Año lleno" period="2026" />}
      />
    </div>
  )
}
