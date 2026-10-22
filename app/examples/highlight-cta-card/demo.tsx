"use client"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { HighlightCtaCard } from "@/registry/blocks/ae/highlight-cta-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <HighlightCtaCard eyebrow="Trámites resueltos este mes" value="84" caption="+18 vs. septiembre" />
      </AeStagger>
    </div>
  )
}
