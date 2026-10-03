"use client"

import * as React from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { RadioCards } from "@/registry/ui/radio-cards"

const planOptions = plans.map((plan) => ({
  value: plan.id,
  label: plan.name,
  description: plan.detail,
  meta: `$${plan.price}`,
}))

export function Demo() {
  const [value, setValue] = React.useState("workshop")
  return (
    <div className="flex flex-col gap-8">
      <RadioCards aria-label={`Plan de ${atelier.name}`} options={planOptions} value={value} onValueChange={setValue} name="plan" />
      <StressCases
        empty={<RadioCards aria-label="Sin plan" options={planOptions} value={null} onValueChange={() => {}} />}
        long={
          <RadioCards
            aria-label="Valor largo"
            options={[{ value: "long", label: unbreakable, description: atelier.kiln, meta: "$0" }]}
            defaultValue="long"
          />
        }
        crowded={
          <RadioCards
            aria-label="Diez"
            layout="list"
            options={people.map((person) => ({ value: person.id, label: person.name, description: person.role }))}
            defaultValue="ines"
          />
        }
      />
    </div>
  )
}
