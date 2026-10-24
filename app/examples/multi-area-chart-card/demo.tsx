"use client"

import { aeAreaSeries } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { MultiAreaChartCard } from "@/registry/blocks/ae/multi-area-chart-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <MultiAreaChartCard labels={aeAreaSeries.labels} series={aeAreaSeries.series} />
      </AeStagger>
    </div>
  )
}
