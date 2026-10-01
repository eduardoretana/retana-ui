"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { SlotText } from "@/registry/ui/slot-text"

export function Demo() {
  const [value, setValue] = useState(1280)
  return (
    <div className="flex flex-col gap-8">
      <button type="button" className="w-fit text-3xl font-semibold tabular-nums" onClick={() => setValue((current) => current + 640)}>
        <SlotText value={value} announce />
      </button>
      <StressCases
        empty={<SlotText value="" />}
        long={<SlotText value={unbreakable} className="max-w-full text-sm" />}
        crowded={
          <div className="flex flex-col gap-1">
            {Array.from({ length: 10 }, (_, index) => (
              <SlotText key={index} value={index * 120} />
            ))}
          </div>
        }
      />
    </div>
  )
}
