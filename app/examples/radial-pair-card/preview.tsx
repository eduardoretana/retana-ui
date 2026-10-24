"use client"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { RadialPairCard } from "@/registry/blocks/ae/radial-pair-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <RadialPairCard items={[{ label: "Tiempo de respuesta", value: 86, caption: "En menos de 2 h" }, { label: "Resolución", value: 72 }]} />
      </AeStagger>
    </div>
  )
}
