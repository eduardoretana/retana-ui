"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { TextReveal } from "@/registry/ui/text-reveal"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <TextReveal as="h2" text={"El horno de Oaxaca\nabre el sábado"} className="text-3xl font-semibold tracking-tight" />
      <StressCases
        empty={<TextReveal text="" />}
        long={<TextReveal text={unbreakable} className="text-sm break-all" />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <TextReveal key={index} as="p" text={`Pieza ${index + 1} lista para el horno`} />
            ))}
          </div>
        }
      />
    </div>
  )
}
