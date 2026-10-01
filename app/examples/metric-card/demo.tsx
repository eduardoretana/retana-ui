"use client"

import { useState } from "react"

import { atelier, people, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/registry/ui/metric-card"

export function Demo() {
  const [value, setValue] = useState(128)
  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-sm flex-col gap-3">
        <MetricCard label="Piezas cocidas" value={value} context={`${atelier.kiln} · ${atelier.city}`} change={value >= 128 ? "+12" : "−4"} />
        <Button type="button" variant="outline" onClick={() => setValue((current) => (current === 128 ? 96 : 128))}>
          Cambiar valor
        </Button>
      </div>
      <StressCases
        empty={<MetricCard label="Vacío" value={0} context="Sin quema" />}
        long={<MetricCard label={unbreakable} value={plans[2].price} context={unbreakable} change="-3" />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person, index) => (
              <MetricCard key={person.id} label={person.name} value={plans[index % plans.length].price} context={person.role} change={index % 2 ? "+1" : "-1"} />
            ))}
          </div>
        }
      />
    </div>
  )
}
