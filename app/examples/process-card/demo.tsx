"use client"

import { useState } from "react"

import { aeProcesses } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { ProcessCard } from "@/registry/blocks/ae/process-card"

export function Demo() {
  const [progress, setProgress] = useState(aeProcesses[0].progress)
  return (
    <div className="ae-ember rounded-3xl bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <ProcessCard {...aeProcesses[0]} progress={progress} highlighted onOpen={() => setProgress((value) => Math.min(100, value + 10))} />
      </AeStagger>
    </div>
  )
}
