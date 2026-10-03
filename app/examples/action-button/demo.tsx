"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { ActionButton } from "@/registry/ui/action-button"

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <ActionButton
        label={`Guardar ${atelier.name}`}
        pendingLabel="Guardando"
        successLabel="Guardado"
        onAction={() => wait(700)}
      />
      <StressCases
        empty={<ActionButton label="" onAction={() => {}} />}
        long={<ActionButton label={unbreakable} onAction={() => {}} className="max-w-full" />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <ActionButton key={person.id} label={person.name} onAction={() => {}} className="max-w-full" />
            ))}
          </div>
        }
      />
    </div>
  )
}
