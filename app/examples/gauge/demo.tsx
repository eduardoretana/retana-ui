"use client"

import { useState } from "react"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { Button } from "@/components/ui/button"
import { Gauge, type GaugeThreshold } from "@/registry/ui/gauge"

const bands: GaugeThreshold[] = [
  { from: 0, tone: "accent", label: "Holgado" },
  { from: 70, tone: "warning", label: "Casi lleno" },
  { from: 90, tone: "danger", label: "Al límite" },
]

export function Demo() {
  const [value, setValue] = useState(72)
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-3">
        <Gauge value={value} label="Ocupación del horno" detail={atelier.kiln} thresholds={bands} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setValue(36)}>
            36
          </Button>
          <Button type="button" variant="outline" onClick={() => setValue(72)}>
            72
          </Button>
          <Button type="button" variant="outline" onClick={() => setValue(96)}>
            96
          </Button>
        </div>
      </div>
      <StressCases
        empty={<Gauge value={0} label="Vacío" detail="Sin carga" />}
        long={<Gauge value={64} label={unbreakable} detail={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-3">
            {people.map((person, index) => (
              <Gauge key={person.id} value={(index + 1) * 9} label={person.name} detail={person.role} />
            ))}
          </div>
        }
      />
    </div>
  )
}
