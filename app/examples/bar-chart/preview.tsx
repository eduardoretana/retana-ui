"use client"

import { BarChart } from "@/registry/ui/bar-chart"

export default function BarChartPreview() {
  return (
    <div className="flex h-full min-w-0 items-center bg-background p-3">
      <BarChart
        className="w-full"
        height={112}
        data={[
          { key: "l", label: "Lunes", axisLabel: "L", value: 14 },
          { key: "m", label: "Martes", axisLabel: "M", value: 22 },
          { key: "x", label: "Miércoles", axisLabel: "X", value: 9 },
          { key: "j", label: "Jueves", axisLabel: "J", value: 18 },
          { key: "v", label: "Viernes", axisLabel: "V", value: 27 },
        ]}
        label="Horno"
        period="Semana"
        unit="pzas"
      />
    </div>
  )
}
