"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { DonutChart } from "@/registry/ui/donut-chart"

const shares = plans.map((plan) => ({ key: plan.id, label: plan.name, value: plan.price }))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <DonutChart data={shares} label="Suscripciones del taller" unit="cuentas" totalLabel="Total" otherLabel="Otras" />
      <StressCases
        empty={<DonutChart data={[]} label="Sin cuentas" emptyLabel="Todavía no hay datos" />}
        long={<DonutChart data={[{ key: "long", label: unbreakable, value: 8 }, { key: "studio", label: plans[0].name, value: 4 }]} label={unbreakable} />}
        crowded={<DonutChart data={people.map((person, index) => ({ key: person.id, label: person.name, value: 12 - index }))} label="Diez personas" size={180} />}
      />
    </div>
  )
}
