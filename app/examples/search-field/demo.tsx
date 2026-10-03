"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { facetTags, unbreakable } from "@/app/examples/arc/demo-data"
import { SearchField } from "@/registry/ui/search-field"

export function Demo() {
  const [value, setValue] = useState("celadon")
  const [empty, setEmpty] = useState("")
  const [long, setLong] = useState(unbreakable)
  return (
    <div className="flex flex-col gap-8">
      <SearchField label="Buscar esmalte" value={value} onValueChange={setValue} placeholder="Celadon, ceniza, cobre" className="max-w-sm" />
      <p className="text-sm text-muted-foreground">
        {facetTags.filter((tag) => tag.includes(value.toLowerCase())).join(", ") || "Sin coincidencias"}
      </p>
      <StressCases
        empty={<SearchField label="Vacía" value={empty} onValueChange={setEmpty} />}
        long={<SearchField label="Larga" value={long} onValueChange={setLong} />}
        crowded={
          <div className="flex flex-col gap-2">
            {facetTags.map((tag) => (
              <SearchField key={tag} label={tag} value="" onValueChange={() => {}} placeholder={tag} />
            ))}
          </div>
        }
      />
    </div>
  )
}
