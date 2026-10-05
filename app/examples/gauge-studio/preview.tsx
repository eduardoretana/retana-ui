"use client"

import { GaugeStudio } from "@/registry/blocks/gauge-studio"

export default function Preview() {
  return (
    <div className="h-full bg-background">
      <GaugeStudio fill className="h-full" />
    </div>
  )
}
