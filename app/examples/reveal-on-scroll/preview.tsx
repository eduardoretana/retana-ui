"use client"

import { RevealOnScroll } from "@/registry/ui/reveal-on-scroll"

export default function Preview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <RevealOnScroll variant="fade" className="w-full rounded-lg border border-border bg-card p-3">
        <p className="text-sm font-medium">Pieza al entrar</p>
        <p className="text-xs text-muted-foreground">Una vez, y se queda.</p>
      </RevealOnScroll>
    </div>
  )
}
