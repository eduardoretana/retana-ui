"use client"

import { Streamgraph } from "@/registry/ui/streamgraph"

const series = [
  { key: "kiln", label: "Horno" },
  { key: "glaze", label: "Esmalte" },
  { key: "pack", label: "Empaque" },
]

export default function StreamgraphPreview() {
  return (
    <div className="flex h-full min-w-0 items-center bg-background p-3">
      <Streamgraph
        className="w-full"
        height={128}
        label="Horas"
        directLabels={false}
        series={series}
        data={["S1", "S2", "S3", "S4"].map((label, index) => ({
          key: label,
          label,
          axisLabel: label,
          values: { kiln: 8 + index, glaze: 5 + ((index * 3) % 4), pack: 3 + index },
        }))}
      />
    </div>
  )
}
