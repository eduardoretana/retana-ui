"use client"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { HighlightCtaCard } from "@/registry/blocks/ae/highlight-cta-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <HighlightCtaCard eyebrow="Trámites resueltos este mes" value="84" caption="+18 vs. septiembre" />
      </AeStagger>
    </div>
  )
}
