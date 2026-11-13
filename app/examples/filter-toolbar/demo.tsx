"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { channels, facetTags, unbreakable } from "@/app/examples/arc/demo-data"
import { FilterToolbar, filterToolbarLabelsEs, type FilterChip } from "@/registry/ui/filter-toolbar"

const fields = [
  { id: "channel", label: "Canal", options: channels },
  { id: "tag", label: "Etiqueta", options: facetTags },
]

// `locale="es"` (o `?lang=es` en la página) pasa el juego es-MX; sin él queda el inglés por defecto.
export function Demo({ locale = "en" }: { locale?: "en" | "es" }) {
  const labels = locale === "es" ? filterToolbarLabelsEs : undefined
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: "channel", label: "Canal", value: "kiln" },
    { id: "tag", label: "Etiqueta", value: "glaze" },
  ])
  return (
    <div className="flex flex-col gap-8">
      <FilterToolbar
        labels={labels}
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
        empty={<FilterToolbar labels={labels} filters={[]} onRemove={() => {}} addFilter={{ fields, onAdd: () => {} }} />}
        long={<FilterToolbar labels={labels} filters={[{ id: "tag", label: "Etiqueta", value: unbreakable }]} onRemove={() => {}} />}
        crowded={
          <FilterToolbar
            labels={labels}
            filters={facetTags.map((tag) => ({ id: tag, label: tag, value: tag }))}
            onRemove={() => {}}
          />
        }
      />
    </div>
  )
}
