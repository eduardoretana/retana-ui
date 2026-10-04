"use client"

import { ConfidenceBadge } from "@/registry/ui/confidence-badge"

export function Demo() {
  return (
    <div className="flex items-center gap-3 bg-background p-3">
      <ConfidenceBadge score={0.87} />
      <ConfidenceBadge score={0.62} variant="dial" />
      <ConfidenceBadge score={0.3} variant="bar" />
    </div>
  )
}
