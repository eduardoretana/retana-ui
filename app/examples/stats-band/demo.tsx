"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { StatsBand, type Stat } from "@/registry/blocks/stats-band"

const stats: Stat[] = [
  { value: 1280, notation: "compact", decimals: 1, label: `Piezas de ${atelier.name}`, detail: `Cocidas en ${atelier.city}`, context: "Ciento veinte más que el año pasado", visual: { kind: "trend", values: [40, 48, 44, 60, 72, 80, 96, 110, 104, 120, 132, 128] } },
  { value: 99.2, decimals: 1, suffix: "%", label: "Hornos a tiempo", detail: atelier.kiln, context: "Un retraso en agosto, de once minutos", visual: { kind: "uptime", days: Array.from({ length: 40 }, (_, day) => (day === 12 ? 96 : 100)) } },
  { value: 18, suffix: " h", label: "De la mesa al horno", detail: "Mediana de la semana", context: "Antes eran veintiséis horas", visual: { kind: "distribution", bins: [1, 3, 8, 12, 9, 4, 2, 1], max: 40, marker: 18 } },
  { value: 6, label: "Ciudades con envío", detail: "La mayoría sale el viernes", context: "Oaxaca, Puebla, y cuatro más", visual: { kind: "map", points: [[-96.7, 17.1], [-98.2, 19.0], [-99.1, 19.4], [-103.3, 20.7], [-100.3, 25.7], [-89.6, 20.97]] } },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <StatsBand layout="divided" title={`El año de ${atelier.name}`} description={`Medido en el taller de ${atelier.city}.`} stats={stats} />
      <StressCases
        empty={<StatsBand stats={[]} title="Cifras" description="" />}
        long={<StatsBand stats={[{ value: 3, label: unbreakable, detail: unbreakable, context: unbreakable }]} />}
        crowded={<StatsBand stats={Array.from({ length: 10 }, (_, index) => ({ value: index + 1, label: `Cifra ${index + 1}`, detail: atelier.city }))} />}
      />
    </div>
  )
}
