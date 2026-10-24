"use client"

import { aeStats } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { StatSparklineCard } from "@/registry/blocks/ae/stat-sparkline-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <StatSparklineCard {...aeStats[0]} />
      </AeStagger>
    </div>
  )
}
