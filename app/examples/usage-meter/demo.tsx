"use client"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { UsageMeter } from "@/registry/ui/usage-meter"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <UsageMeter
        label={`Almacén · ${atelier.name}`}
        unit="GB"
        limit={100}
        freeLabel="Libre"
        overLabel="Sobre el límite"
        segments={[
          { id: "glaze", label: "Esmalte", value: 42 },
          { id: "clay", label: "Barro", value: 28 },
          { id: "photos", label: "Fotos", value: 11 },
        ]}
      />
      <StressCases
        empty={<UsageMeter label="Vacío" segments={[]} limit={100} unit="GB" freeLabel="Libre" />}
        long={
          <UsageMeter
            label={unbreakable}
            limit={100}
            unit="GB"
            segments={[{ id: "long", label: unbreakable, value: 12 }]}
          />
        }
        crowded={
          <UsageMeter
            label="Diez categorías"
            limit={100}
            unit="GB"
            freeLabel="Libre"
            segments={people.map((person, index) => ({ id: person.id, label: person.name, value: index + 1 }))}
          />
        }
      />
    </div>
  )
}
