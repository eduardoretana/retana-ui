"use client"

import { aeMonthly } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { BarTrendCard } from "@/registry/blocks/ae/bar-trend-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <BarTrendCard data={aeMonthly} />
      </AeStagger>
    </div>
  )
}
