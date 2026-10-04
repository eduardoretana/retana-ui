"use client"

import { NetworkStatus } from "@/registry/ui/network-status"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <NetworkStatus offlineReady />
    </div>
  )
}
