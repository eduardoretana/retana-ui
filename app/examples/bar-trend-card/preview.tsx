"use client"

import { aeMonthly } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { BarTrendCard } from "@/registry/blocks/ae/bar-trend-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <BarTrendCard data={aeMonthly} />
      </AeStagger>
    </div>
  )
}
