"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { TextShimmer } from "@/registry/ui/text-shimmer"

export function Demo() {
  const [active, setActive] = useState(true)
  return (
    <div className="flex flex-col gap-8">
      <button type="button" className="w-fit text-left" onClick={() => setActive((current) => !current)}>
        <TextShimmer active={active}>{active ? "Cociendo el lote" : "Lote listo"}</TextShimmer>
      </button>
      <StressCases
        empty={<TextShimmer active={false}>{""}</TextShimmer>}
        long={<TextShimmer className="max-w-full">{unbreakable}</TextShimmer>}
        crowded={
          <div className="flex flex-col gap-1">
            {Array.from({ length: 10 }, (_, index) => (
              <TextShimmer key={index}>{`Horno ${index + 1}`}</TextShimmer>
            ))}
          </div>
        }
      />
    </div>
  )
}
