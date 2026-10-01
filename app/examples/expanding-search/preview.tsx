"use client"

import { people } from "@/app/examples/arc/demo-data"
import { ExpandingSearch } from "@/registry/ui/expanding-search"

export default function ExpandingSearchPreview() {
  return (
    <div className="flex h-full items-center justify-end bg-background p-3">
      <ExpandingSearch
        label="Buscar"
        items={people.slice(0, 4).map((person) => ({ id: person.id, title: person.name, meta: person.role }))}
        className="w-full"
      />
    </div>
  )
}
