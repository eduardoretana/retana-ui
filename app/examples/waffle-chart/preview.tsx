"use client"

import { WaffleChart } from "@/registry/ui/waffle-chart"

export default function WaffleChartPreview() {
  return (
    <div className="flex h-full w-full items-center bg-background p-3">
      <WaffleChart
        className="w-full"
        label="Horno"
        data={[
          { key: "bisque", label: "Bizcocho", value: 50 },
          { key: "glaze", label: "Esmalte", value: 30 },
          { key: "loss", label: "Merma", value: 20 },
        ]}
      />
    </div>
  )
}
