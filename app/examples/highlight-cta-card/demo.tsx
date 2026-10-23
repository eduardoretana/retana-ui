"use client"

import { useState } from "react"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { HighlightCtaCard } from "@/registry/blocks/ae/highlight-cta-card"

export function Demo() {
  const [count, setCount] = useState(84)
  return (
    <div className="ae-ember rounded-3xl bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <HighlightCtaCard eyebrow="Trámites resueltos este mes" value={String(count)} caption="Cada clic suma uno (demo)." onAction={() => setCount((value) => value + 1)} />
      </AeStagger>
    </div>
  )
}
