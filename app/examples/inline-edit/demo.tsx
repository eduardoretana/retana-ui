"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { InlineEdit } from "@/registry/ui/inline-edit"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <InlineEdit label="Nombre del taller" value={atelier.name} onSave={() => {}} />
      <InlineEdit label="Nota" value="Gres de alta temperatura, esmalte de ceniza." variant="body" multiline onSave={() => {}} />
      <StressCases
        empty={<InlineEdit label="Vacío" value="" placeholder="Sin nombre" onSave={() => {}} />}
        long={<InlineEdit label="Largo" value={unbreakable} onSave={() => {}} />}
        crowded={
          <div className="flex flex-col gap-2">
            {people.slice(0, 10).map((person) => (
              <InlineEdit key={person.id} label={person.role} value={person.name} variant="body" onSave={() => {}} />
            ))}
          </div>
        }
      />
    </div>
  )
}
