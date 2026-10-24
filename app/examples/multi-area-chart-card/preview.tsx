"use client"

import { aeAreaSeries } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { MultiAreaChartCard } from "@/registry/blocks/ae/multi-area-chart-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <MultiAreaChartCard labels={aeAreaSeries.labels} series={aeAreaSeries.series} />
      </AeStagger>
    </div>
  )
}
