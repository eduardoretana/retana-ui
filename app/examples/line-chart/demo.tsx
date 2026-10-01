"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { plans, unbreakable } from "@/app/examples/arc/demo-data"
import { LineChart, type LineChartDatum, type LineChartSeries } from "@/registry/ui/line-chart"

const series: LineChartSeries[] = [
  { key: "kiln", label: "Horno" },
  { key: "glaze", label: "Esmalte", dashed: true },
]

const week: LineChartDatum[] = ["Lun", "Mar", "Mié", "Jue", "Vie"].map((day, index) => ({
  key: day,
  label: day,
  axisLabel: day,
  values: { kiln: [12, 18, 9, 21, 16][index], glaze: [4, 7, 11, 6, 14][index] },
}))

const ten: LineChartDatum[] = Array.from({ length: 10 }, (_, index) => ({
  key: `d${index + 1}`,
  label: `Día ${index + 1}`,
  axisLabel: String(index + 1),
  values: { kiln: 8 + index, glaze: 14 - index },
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <LineChart data={week} series={series} label={`${plans[1].name} · piezas`} unit="pzas" categoryLabel="Día" />
      <StressCases
        empty={<LineChart data={[]} series={series} label="Sin datos" emptyLabel="Nada en este rango" />}
        long={<LineChart data={week} series={[{ key: "kiln", label: unbreakable }, { key: "glaze", label: "Esmalte", dashed: true }]} label={unbreakable} />}
        crowded={<LineChart data={ten} series={series} label="Diez días" height={160} />}
      />
    </div>
  )
}
