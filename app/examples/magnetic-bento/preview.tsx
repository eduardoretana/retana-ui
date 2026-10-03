"use client"

import { Compass, Droplets } from "lucide-react"

import {
  MagneticBento,
  MagneticBentoDescription,
  MagneticBentoIcon,
  MagneticBentoIndex,
  MagneticBentoItem,
  MagneticBentoTitle,
} from "@/registry/ui/magnetic-bento"

export default function MagneticBentoPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <MagneticBento label="Vista previa" defaultActive="horno" className="w-full">
        <MagneticBentoItem value="horno" span={{ col: 2, row: 1 }} accent="chart-1" style={{ minHeight: 72 }}>
          <MagneticBentoIcon>
            <Compass className="size-4" />
          </MagneticBentoIcon>
          <MagneticBentoIndex>01</MagneticBentoIndex>
          <MagneticBentoTitle>Horno norte</MagneticBentoTitle>
          <MagneticBentoDescription>Quemas de la semana.</MagneticBentoDescription>
        </MagneticBentoItem>
        <MagneticBentoItem value="esmalte" accent="chart-2" style={{ minHeight: 72 }}>
          <MagneticBentoIcon>
            <Droplets className="size-4" />
          </MagneticBentoIcon>
          <MagneticBentoIndex>02</MagneticBentoIndex>
          <MagneticBentoTitle>Esmalte</MagneticBentoTitle>
          <MagneticBentoDescription>Recetas del taller.</MagneticBentoDescription>
        </MagneticBentoItem>
      </MagneticBento>
    </div>
  )
}
