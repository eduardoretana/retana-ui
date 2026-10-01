"use client"

import { ActivityHeatmap } from "@/registry/ui/activity-heatmap"

const start = Date.parse("2026-03-01T00:00:00Z")
const days = Array.from({ length: 28 }, (_, index) => ({
  date: new Date(start + index * 86_400_000).toISOString().slice(0, 10),
  count: index % 6,
}))

export default function ActivityHeatmapPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ActivityHeatmap className="w-full" days={days} label="Marzo" period="marzo" />
    </div>
  )
}
