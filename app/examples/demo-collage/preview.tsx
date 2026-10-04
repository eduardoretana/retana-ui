"use client"

import { DemoCollage } from "@/registry/blocks/demo-collage"
import { ConfidenceBadge } from "@/registry/ui/confidence-badge"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <DemoCollage items={[{ name: "confidence-badge", href: "/examples/confidence-badge", render: () => <ConfidenceBadge score={0.8} /> }]} />
    </div>
  )
}
