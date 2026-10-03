"use client"

import { SlopeChart } from "@/registry/ui/slope-chart"

export default function SlopeChartPreview() {
  return (
    <div className="flex h-full w-full items-center bg-background p-3">
      <SlopeChart
        className="w-full"
        label="Pedidos"
        startLabel="Antes"
        endLabel="Después"
        highlightKey="gallery"
        height={160}
        data={[
          { key: "gallery", label: "Galería", start: 18, end: 27 },
          { key: "wholesale", label: "Mayoreo", start: 32, end: 21 },
          { key: "workshop", label: "Taller", start: 14, end: 19 },
        ]}
      />
    </div>
  )
}
