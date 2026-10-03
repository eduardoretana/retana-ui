"use client"

import { ComparisonTable } from "@/registry/blocks/comparison-table"

export default function ComparisonTablePreview() {
  return (
    <div className="h-full bg-background p-3">
      <ComparisonTable
        className="[&_h2]:text-lg"
        title="Planes"
        description=""
        stackBelow={10000}
        columns={[
          { id: "atelier", name: "Costa", caption: "Taller", highlight: true },
          { id: "studio", name: "Studio", caption: "$24" },
          { id: "house", name: "House", caption: "$120" },
        ]}
        sections={[
          {
            id: "taller",
            title: "Taller",
            rows: [
              { id: "kiln", feature: "Hornos", values: { atelier: "Todos", studio: "Uno", house: "Todos" } },
              { id: "glaze", feature: "Vidrio", values: { atelier: true, studio: false, house: true } },
            ],
          },
        ]}
      />
    </div>
  )
}
