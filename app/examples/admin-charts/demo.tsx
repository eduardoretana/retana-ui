"use client"

import { useState } from "react"

import {
  FunnelChart,
  Heatmap,
  RankedBars,
  ScrollDepthChart,
  StatCard,
  TrendChart,
} from "@/registry/ui/admin-charts"

const points = [
  { label: "Lun", visitors: 120, views: 240 },
  { label: "Mar", visitors: 140, views: 260 },
  { label: "Mié", visitors: 110, views: 210 },
  { label: "Jue", visitors: 180, views: 320 },
  { label: "Vie", visitors: 160, views: 280 },
  { label: "Sáb", visitors: 70, views: 120 },
  { label: "Dom", visitors: 60, views: 100 },
]

const heat = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ((day + 1) * (hour % 5)) % 8),
)

export function AdminChartsDemo() {
  const [range, setRange] = useState("7d")

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 bg-background p-6">
      <h1 className="text-xl font-semibold">Analítica</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Visitantes" value={1284} previous={1100} sparkline={[20, 24, 22, 30, 28, 36]} tone={1} caption="vs. periodo anterior" />
        <StatCard label="Páginas" value={2408} previous={2600} sparkline={[40, 32, 36, 30, 28, 26]} tone={2} caption="vs. periodo anterior" />
        <StatCard label="Clics" value={86} previous={70} tone={3} caption="vs. periodo anterior" />
      </div>
      <TrendChart
        title="Tráfico"
        description="Visitantes y páginas vistas."
        visitorsLabel="Visitantes"
        viewsLabel="Páginas vistas"
        rangeLabel="Periodo"
        points={points}
        range={range}
        onRangeChange={setRange}
        ranges={[
          { key: "7d", label: "7 días" },
          { key: "30d", label: "30 días" },
        ]}
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <FunnelChart
          title="Embudo"
          steps={[
            { label: "Sesiones", value: 420, tone: 1 },
            { label: "Vieron precios", value: 160, tone: 2 },
            { label: "Reservaron", value: 28, tone: 3 },
          ]}
        />
        <RankedBars
          title="Fuentes"
          tone={2}
          emptyLabel="Sin datos"
          items={[
            { label: "Directo", value: 180 },
            { label: "example.test", value: 90 },
            { label: "noticias.example", value: 40 },
          ]}
        />
      </div>
      <Heatmap
        grid={heat}
        title="Día y hora"
        description="Las celdas más oscuras tuvieron más visitas."
        dayLabels={["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]}
      />
      <ScrollDepthChart
        title="Profundidad de scroll"
        description="Parte de las visitas que llegó a cada marca."
        valueLabel="Alcanzaron"
        marks={[
          { label: "25%", value: 0.9 },
          { label: "50%", value: 0.7 },
          { label: "75%", value: 0.4 },
          { label: "100%", value: 0.18 },
        ]}
      />
    </main>
  )
}
