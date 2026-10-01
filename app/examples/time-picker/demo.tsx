"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { TimePicker } from "@/registry/ui/time-picker"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <TimePicker label={`Hora en ${atelier.city}`} description={atelier.kiln} defaultValue="09:00" className="max-w-sm" />
      <StressCases
        empty={<TimePicker label="Sin hora" value="" placeholder="Elige una hora" />}
        long={<TimePicker label="Nota larga" defaultValue="14:30" description={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.map((person, index) => (
              <TimePicker key={person.id} label={person.name} defaultValue={`${String(8 + (index % 12)).padStart(2, "0")}:00`} />
            ))}
          </div>
        }
      />
    </div>
  )
}
