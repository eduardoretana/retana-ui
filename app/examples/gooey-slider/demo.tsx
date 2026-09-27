"use client"

import { useState } from "react"

import { GooeySlider } from "@/registry/ui/gooey-slider"

export function Demo() {
  const [value, setValue] = useState(36)
  return (
    <div className="flex flex-col gap-3">
      <GooeySlider value={value} onValueChange={setValue} label="Intensidad del trazo" />
      <p className="text-sm text-muted-foreground tabular-nums">Intensidad {value}</p>
    </div>
  )
}
