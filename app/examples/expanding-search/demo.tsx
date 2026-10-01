"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { ExpandingSearch, type ExpandingSearchItem } from "@/registry/ui/expanding-search"

const items: ExpandingSearchItem[] = people.map((person) => ({
  id: person.id,
  title: person.name,
  meta: person.role,
  group: person.role,
  keywords: [person.role],
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <ExpandingSearch label="Buscar en el taller" items={items} suggestions={items.slice(0, 3)} suggestionsLabel="Recientes" placeholder="Nombre o puesto" />
      </div>
      <StressCases
        empty={<ExpandingSearch label="Sin piezas" items={[]} emptyHint="El catálogo está vacío." />}
        long={
          <ExpandingSearch
            label="Buscar"
            items={[{ id: "long", title: unbreakable, meta: "Archivo" }]}
          />
        }
        crowded={
          <div className="flex flex-col gap-2">
            {items.slice(0, 10).map((item) => (
              <ExpandingSearch key={item.id} label={item.title} items={[item]} />
            ))}
          </div>
        }
      />
    </div>
  )
}
