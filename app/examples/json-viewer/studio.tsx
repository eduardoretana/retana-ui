"use client"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { JsonViewer } from "@/registry/ui/json-viewer"

const firing = {
  kiln: atelier.kiln,
  city: atelier.city,
  lead: people[0]?.name,
  note: "ash glaze, slow cool",
  temps: [980, 1040, 1100, 1180, 1220, 1240, 1260, 1280],
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <JsonViewer data={firing} label="Carga del horno" pageSize={4} className="w-full" />
      <StressCases
        empty={<JsonViewer data={{}} label="Vacío" searchable={false} showPath={false} />}
        long={<JsonViewer data={{ spec: unbreakable }} label="Nota larga" maxHeight={180} />}
        crowded={
          <JsonViewer
            label="Equipo"
            maxHeight={220}
            data={Object.fromEntries(people.map((person) => [person.id, person.name]))}
          />
        }
      />
    </div>
  )
}
