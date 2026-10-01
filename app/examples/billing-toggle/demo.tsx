"use client"

import * as React from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, plans, unbreakable } from "@/app/examples/arc/demo-data"
import { BillingPrice, BillingToggle } from "@/registry/ui/billing-toggle"

export function Demo() {
  const [period, setPeriod] = React.useState("yearly")
  const plan = plans[1]
  const yearly = period === "yearly"
  const amount = yearly ? Math.round(plan.price * 12 * 0.8) : plan.price
  return (
    <div className="flex max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-3">
        <BillingToggle
          label={`Periodo · ${atelier.name}`}
          value={period}
          onValueChange={setPeriod}
          options={[
            { value: "monthly", label: "Mensual" },
            { value: "yearly", label: "Anual", badge: "Ahorra 20%", activeBadge: `Ahorras $${plan.price * 12 - amount}` },
          ]}
        />
        <BillingPrice amount={amount} was={yearly ? plan.price * 12 : undefined} period={yearly ? "al año" : "al mes"} />
        <p className="text-sm text-muted-foreground">
          {plan.name} · {plan.detail}
        </p>
      </div>
      <StressCases
        empty={
          <BillingToggle
            label="Sin nota"
            value="monthly"
            onValueChange={() => {}}
            options={[
              { value: "monthly", label: "Mes" },
              { value: "yearly", label: "Año" },
            ]}
          />
        }
        long={
          <BillingToggle
            label="Nota larga"
            value="yearly"
            onValueChange={() => {}}
            options={[
              { value: "monthly", label: "Mes" },
              { value: "yearly", label: "Año", badge: unbreakable, activeBadge: unbreakable },
            ]}
          />
        }
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <BillingToggle
                key={person.id}
                label={person.name}
                value="monthly"
                onValueChange={() => {}}
                options={[
                  { value: "monthly", label: person.role },
                  { value: "yearly", label: "Año", badge: "−20%" },
                ]}
              />
            ))}
          </div>
        }
      />
    </div>
  )
}
