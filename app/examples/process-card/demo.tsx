"use client"

import { aeProcesses } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { ProcessCard } from "@/registry/blocks/ae/process-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <ProcessCard {...aeProcesses[0]} highlighted />
      </AeStagger>
    </div>
  )
}
