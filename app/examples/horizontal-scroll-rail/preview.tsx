"use client"

import { HorizontalScrollRail } from "@/registry/ui/horizontal-scroll-rail"

const cards = ["Secado", "Esmalte", "Bajada"]

export default function Preview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <HorizontalScrollRail label="Etapas" paneClassName="h-28" itemClassName="w-28">
        {cards.map((card) => (
          <div key={card} tabIndex={0} className="rounded-lg border border-border bg-card p-3 text-sm">
            {card}
          </div>
        ))}
      </HorizontalScrollRail>
    </div>
  )
}
