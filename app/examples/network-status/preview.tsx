"use client"

import { NetworkStatus } from "@/registry/ui/network-status"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <NetworkStatus offlineReady />
    </div>
  )
}
