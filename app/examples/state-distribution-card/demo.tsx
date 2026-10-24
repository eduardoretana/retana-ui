"use client"

import { aeStates } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { StateDistributionCard } from "@/registry/blocks/ae/state-distribution-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <StateDistributionCard items={aeStates} />
      </AeStagger>
    </div>
  )
}
