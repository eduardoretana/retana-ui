"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { channels, facetTags, unbreakable } from "@/app/examples/arc/demo-data"
import { FilterToolbar, type FilterChip } from "@/registry/ui/filter-toolbar"

const fields = [
  { id: "channel", label: "Canal", options: channels },
  { id: "tag", label: "Etiqueta", options: facetTags },
]

export function Demo() {
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: "channel", label: "Canal", value: "kiln" },
    { id: "tag", label: "Etiqueta", value: "glaze" },
  ])
  return (
    <div className="flex flex-col gap-8">
      <FilterToolbar
        filters={filters}
        onRemove={(id) => setFilters((current) => current.filter((filter) => filter.id !== id))}
        onClearAll={() => setFilters([])}
        addFilter={{
          label: "Añadir filtro",
          fields,
          onAdd: (filter) => setFilters((current) => [...current.filter((item) => item.id !== filter.id), filter]),
        }}
      />
      <StressCases
        empty={<FilterToolbar filters={[]} onRemove={() => {}} addFilter={{ fields, onAdd: () => {} }} />}
        long={<FilterToolbar filters={[{ id: "tag", label: "Etiqueta", value: unbreakable }]} onRemove={() => {}} />}
        crowded={
          <FilterToolbar
            filters={facetTags.map((tag) => ({ id: tag, label: tag, value: tag }))}
            onRemove={() => {}}
          />
        }
      />
    </div>
  )
}
