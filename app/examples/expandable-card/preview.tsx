"use client"

import { ExpandableCard } from "@/registry/ui/expandable-card"

export default function ExpandableCardPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <ExpandableCard title="Horno" description="Sábado" defaultExpanded>
        <p className="text-sm">Cono 6</p>
      </ExpandableCard>
    </div>
  )
}
