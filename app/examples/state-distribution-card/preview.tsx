"use client"

import { aeStates } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { StateDistributionCard } from "@/registry/blocks/ae/state-distribution-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <StateDistributionCard items={aeStates} />
      </AeStagger>
    </div>
  )
}
