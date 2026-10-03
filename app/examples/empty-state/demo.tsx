"use client"

import { useState } from "react"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/registry/ui/empty-state"

export function Demo() {
  const [fired, setFired] = useState(false)
  return (
    <div className="flex flex-col gap-8">
      <EmptyState
        label="Horno"
        title={fired ? "Quema registrada" : "Sin piezas en el horno"}
        description={fired ? `${atelier.kiln} ya tiene una curva.` : `${atelier.name} todavía no registra una quema.`}
        action={
          <Button type="button" variant="outline" onClick={() => setFired((current) => !current)}>
            {fired ? "Vaciar" : "Registrar quema"}
          </Button>
        }
      />
      <StressCases
        empty={<EmptyState title="Vacío" description="Nada que mostrar." />}
        long={<EmptyState title={unbreakable} description={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <EmptyState key={person.id} title={person.name} description={person.role} />
            ))}
          </div>
        }
      />
    </div>
  )
}
