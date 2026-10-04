"use client"

import { CapabilityGate } from "@/registry/ui/capability-gate"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <CapabilityGate requires="webgpu">
        <p className="text-sm">WebGPU is available.</p>
      </CapabilityGate>
    </div>
  )
}
