"use client"

import { LineChart } from "@/registry/ui/line-chart"

export default function LineChartPreview() {
  return (
    <div className="flex h-full min-w-0 items-center bg-background p-3">
      <LineChart
        className="w-full"
        height={120}
        label="Piezas"
        legend
        series={[
          { key: "kiln", label: "Horno" },
          { key: "glaze", label: "Esmalte", dashed: true },
        ]}
        data={[
          { key: "l", label: "Lun", axisLabel: "L", values: { kiln: 12, glaze: 4 } },
          { key: "m", label: "Mar", axisLabel: "M", values: { kiln: 18, glaze: 7 } },
          { key: "x", label: "Mié", axisLabel: "X", values: { kiln: 9, glaze: 11 } },
          { key: "j", label: "Jue", axisLabel: "J", values: { kiln: 21, glaze: 6 } },
        ]}
      />
    </div>
  )
}
