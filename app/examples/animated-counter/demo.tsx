"use client"

import { useState } from "react"

import { people, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { Button } from "@/components/ui/button"
import { AnimatedCounter } from "@/registry/ui/animated-counter"

export function Demo() {
  const [value, setValue] = useState(plans[1].price)
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-3">
        <AnimatedCounter value={value} prefix="$" suffix=" USD" label="Workshop" />
        <Button type="button" variant="outline" onClick={() => setValue((current) => (current === plans[1].price ? plans[2].price : plans[1].price))}>
          Cambiar cifra
        </Button>
      </div>
      <StressCases
        empty={<AnimatedCounter value={0} label="Vacío" />}
        long={<AnimatedCounter value={plans[0].price} label={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-3">
            {people.map((person, index) => (
              <AnimatedCounter key={person.id} value={plans[index % plans.length].price} label={person.name} prefix="$" />
            ))}
          </div>
        }
      />
    </div>
  )
}
