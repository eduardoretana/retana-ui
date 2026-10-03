"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { MetricCard } from "@/registry/ui/metric-card"

export default function MetricCardPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <MetricCard label="Piezas cocidas" value={128} context={atelier.city} change="+12" className="w-full" />
    </div>
  )
}
