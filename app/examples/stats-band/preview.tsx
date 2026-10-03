"use client"

import { StatsBand } from "@/registry/blocks/stats-band"

export default function StatsBandPreview() {
  return (
    <div className="h-full bg-background p-3">
      <StatsBand
        className="[&_h2]:text-base"
        stats={[
          { value: 1280, label: "Piezas", suffix: "" },
          { value: 6, label: "Ciudades" },
        ]}
      />
    </div>
  )
}
