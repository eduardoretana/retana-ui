"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { Streamgraph, type StreamgraphDatum, type StreamgraphSeries } from "@/registry/ui/streamgraph"

const series: StreamgraphSeries[] = people.slice(0, 4).map((person) => ({ key: person.id, label: person.role }))

const weeks: StreamgraphDatum[] = ["S1", "S2", "S3", "S4", "S5", "S6"].map((label, index) => ({
  key: label,
  label: `Semana ${index + 1}`,
  axisLabel: label,
  values: Object.fromEntries(series.map((line, layer) => [line.key, 6 + ((index + 1) * (layer + 2)) % 11])),
}))

const tenSeries: StreamgraphSeries[] = people.map((person) => ({ key: person.id, label: person.role }))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <Streamgraph data={weeks} series={series} label="Horas por banco" unit="h" categoryLabel="Semana" />
      <StressCases
        empty={<Streamgraph data={[]} series={series} label="Sin horas" emptyLabel="Nada en este rango" />}
        long={<Streamgraph data={weeks} series={[{ key: series[0].key, label: unbreakable }, ...series.slice(1)]} label={unbreakable} />}
        crowded={<Streamgraph data={weeks} series={tenSeries} label="Diez bancos" height={200} directLabels={false} />}
      />
    </div>
  )
}
