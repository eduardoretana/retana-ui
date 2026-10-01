"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { BarChart, type BarChartDatum } from "@/registry/ui/bar-chart"

const week: BarChartDatum[] = [
  { key: "2026-09-15", label: "Lunes 15 sep", axisLabel: "L", value: 14 },
  { key: "2026-09-16", label: "Martes 16 sep", axisLabel: "M", value: 22 },
  { key: "2026-09-17", label: "Miércoles 17 sep", axisLabel: "X", value: 9 },
  { key: "2026-09-18", label: "Jueves 18 sep", axisLabel: "J", value: 18 },
  { key: "2026-09-19", label: "Viernes 19 sep", axisLabel: "V", value: 27 },
  { key: "2026-09-20", label: "Sábado 20 sep", axisLabel: "S", value: 6 },
  { key: "2026-09-21", label: "Domingo 21 sep", axisLabel: "D", value: 11 },
]

const ten: BarChartDatum[] = Array.from({ length: 10 }, (_, index) => ({
  key: `day-${index + 1}`,
  label: `Día ${index + 1} · ${atelier.kiln}`,
  axisLabel: String(index + 1),
  value: 4 + ((index * 5) % 17),
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <BarChart data={week} label="Piezas del horno" period="15–21 sep · Costa Atelier" unit="pzas" averageLabel="Promedio diario" valueLabel="Total" categoryLabel="Día" />
      <StressCases
        empty={<BarChart data={[]} label="Sin piezas" period={atelier.city} />}
        long={<BarChart data={[{ key: "long", label: unbreakable, axisLabel: "N", value: 3 }]} label={unbreakable} period={atelier.name} />}
        crowded={<BarChart data={ten} label="Diez días" period={atelier.kiln} categoryLabel="Día" height={140} />}
      />
    </div>
  )
}
