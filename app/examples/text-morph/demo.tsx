"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { TextMorph } from "@/registry/ui/text-morph"

const states = ["Publicar", "Publicando", "Publicado"]

export function Demo() {
  const [index, setIndex] = useState(0)
  const label = states[index % states.length]
  return (
    <div className="flex flex-col gap-8">
      <button type="button" className="w-fit rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setIndex((current) => current + 1)}>
        <TextMorph>{label}</TextMorph>
      </button>
      <StressCases
        empty={<TextMorph>{""}</TextMorph>}
        long={<TextMorph className="max-w-full text-sm">{unbreakable}</TextMorph>}
        crowded={
          <div className="flex flex-col gap-1">
            {Array.from({ length: 10 }, (_, item) => (
              <TextMorph key={item}>{`Pieza ${item + 1}`}</TextMorph>
            ))}
          </div>
        }
      />
    </div>
  )
}
