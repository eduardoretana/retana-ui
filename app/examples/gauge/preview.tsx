"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { Gauge } from "@/registry/ui/gauge"

export default function GaugePreview() {
  return (
    <div className="flex h-full items-center justify-center bg-background p-3">
      <Gauge value={72} label="Ocupación" detail={atelier.city} className="w-full" />
    </div>
  )
}
