"use client"

import { aeStats } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { StatSparklineCard } from "@/registry/blocks/ae/stat-sparkline-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <StatSparklineCard {...aeStats[0]} />
      </AeStagger>
    </div>
  )
}
