"use client"

import { GooeySlider } from "@/registry/ui/gooey-slider"

export default function GooeySliderPreview() {
  return (
    <div className="flex h-full items-center bg-background px-4">
      <GooeySlider defaultValue={64} label="Intensidad" />
    </div>
  )
}
