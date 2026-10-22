"use client"

import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { RadialPairCard } from "@/registry/blocks/ae/radial-pair-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <RadialPairCard items={[{ label: "Tiempo de respuesta", value: 86, caption: "En menos de 2 h" }, { label: "Resolución", value: 72 }]} />
      </AeStagger>
    </div>
  )
}
