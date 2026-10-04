"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/local-first/capability-gate/capability-gate.tsx

import * as React from "react"
import { ShieldAlert } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useCapabilities, type DeviceCapabilities } from "@/registry/retana/hooks/use-device-capabilities"

export type CapabilityName = keyof DeviceCapabilities["features"]

export type CapabilityGateProps = {
  requires?: CapabilityName | CapabilityName[]
  test?: (capabilities: DeviceCapabilities) => boolean
  fallback?: React.ReactNode
  pending?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

const WHY: Partial<Record<CapabilityName, string>> = {
  webgpu: "This feature needs WebGPU.",
  opfs: "This feature needs origin private file storage.",
  wasm: "This feature needs WebAssembly.",
  sharedarraybuffer: "This feature needs cross-origin isolation.",
}

export function CapabilityGate({ requires, test, fallback, pending, action, children, className }: CapabilityGateProps) {
  const { capabilities, loading } = useCapabilities()
  if (loading || !capabilities) {
    return pending ?? <Skeleton className={cn("h-16 w-full", className)} />
  }
  const names = requires == null ? [] : Array.isArray(requires) ? requires : [requires]
  const passed = test ? test(capabilities) : names.every((name) => capabilities.features[name])
  if (passed) return <>{children}</>
  if (fallback) return <>{fallback}</>
  const missing = names.find((name) => !capabilities.features[name])
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground", className)}>
      <p className="flex items-center gap-2 font-medium text-foreground">
        <ShieldAlert aria-hidden="true" className="size-4" />
        {missing ? (WHY[missing] ?? `This feature needs ${missing}.`) : "This browser cannot run this feature."}
      </p>
      <p>Try a current Chromium, Firefox, or Safari release.</p>
      {action}
    </div>
  )
}
