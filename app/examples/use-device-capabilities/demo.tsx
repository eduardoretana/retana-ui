"use client"

import { useCapabilities, useNetworkStatus } from "@/registry/retana/hooks/use-device-capabilities"

export function Demo() {
  const { capabilities, loading } = useCapabilities()
  const network = useNetworkStatus()
  return (
    <div className="bg-background p-3 text-sm">
      <p>{loading ? "Detecting…" : capabilities?.browser.name}</p>
      <p className="text-muted-foreground">{network.online ? "Online" : "Offline"}</p>
    </div>
  )
}
