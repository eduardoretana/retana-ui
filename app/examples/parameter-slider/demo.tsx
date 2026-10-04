"use client"

import { ParameterSlider } from "@/registry/ui/parameter-slider"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <ParameterSlider label="Variation" min={0} max={1} step={0.05} defaultValue={0.4} info="How far the draft may wander." marks={[{ value: 0, label: "Precise" }, { value: 0.5, label: "Balanced" }, { value: 1, label: "Creative" }]} />
    </div>
  )
}
