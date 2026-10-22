"use client"

import { aeProcesses } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { ProcessCard } from "@/registry/blocks/ae/process-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <ProcessCard {...aeProcesses[0]} highlighted />
      </AeStagger>
    </div>
  )
}
