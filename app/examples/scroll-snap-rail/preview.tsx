"use client"

import { ScrollSnapPanel, ScrollSnapRail } from "@/registry/ui/scroll-snap-rail"

export default function Preview() {
  return (
    <ScrollSnapRail label="Etapas" className="h-full bg-background">
      <ScrollSnapPanel className="flex h-full items-center justify-center">
        <p className="text-3xl font-semibold tabular-nums text-muted-foreground">01</p>
      </ScrollSnapPanel>
    </ScrollSnapRail>
  )
}
