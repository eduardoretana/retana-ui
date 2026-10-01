"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { InViewTitle, type InViewTitleVariant } from "@/registry/ui/in-view-title"

const variants: InViewTitleVariant[] = ["blur", "word", "line", "tracking", "wipe"]

export function Demo() {
  return (
    <div className="flex flex-col gap-10">
      {variants.map((variant) => (
        <InViewTitle key={variant} variant={variant} text="Barro de la costa" className="text-3xl font-semibold tracking-tight" />
      ))}
      <StressCases
        empty={<InViewTitle text="" />}
        long={<InViewTitle text={unbreakable} className="text-sm" />}
        crowded={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }, (_, index) => (
              <InViewTitle key={index} as="h3" text={`Sección ${index + 1}`} />
            ))}
          </div>
        }
      />
    </div>
  )
}
