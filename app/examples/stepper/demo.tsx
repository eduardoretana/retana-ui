"use client"

import { useState } from "react"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { Button } from "@/components/ui/button"
import { Stepper, type StepperStep } from "@/registry/ui/stepper"

const firing: StepperStep[] = [
  { id: "prep", label: "Preparar", description: atelier.kiln },
  { id: "load", label: "Cargar", description: "Piezas del taller" },
  { id: "fire", label: "Cocer", description: "Curva de stoneware" },
  { id: "cool", label: "Enfriar", description: "Abrir al día siguiente" },
]

export function Demo() {
  const [current, setCurrent] = useState(1)
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Stepper steps={firing} current={current} onStepSelect={setCurrent} label="Quema" completeLabel="Quema lista" />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setCurrent((step) => Math.max(0, step - 1))}>
            Atrás
          </Button>
          <Button type="button" variant="outline" onClick={() => setCurrent((step) => Math.min(firing.length, step + 1))}>
            Siguiente
          </Button>
        </div>
      </div>
      <StressCases
        empty={<Stepper steps={[]} current={0} label="Vacío" />}
        long={<Stepper steps={[{ id: "long", label: unbreakable, description: unbreakable }]} current={0} label="Paso largo" />}
        crowded={
          <Stepper
            label="Diez pasos"
            current={3}
            steps={people.map((person) => ({ id: person.id, label: person.name, description: person.role }))}
          />
        }
      />
    </div>
  )
}
