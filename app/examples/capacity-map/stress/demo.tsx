"use client"

import { CapacityMap } from "@/registry/ui/capacity-map"

import { longNameZones, stressZones } from "../fixtures"

export function StressDemo() {
  return (
    <div className="flex flex-col gap-8">
      <CapacityMap zones={stressZones(500)} locale="es-MX" defaultOpenZoneIds={["z0"]} layout="wrap" />
      <CapacityMap zones={longNameZones()} locale="es-MX" defaultOpenZoneIds={["z"]} layout="list" />
    </div>
  )
}
