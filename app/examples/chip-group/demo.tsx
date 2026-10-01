"use client"

import * as React from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, facetTags, people, unbreakable } from "@/app/examples/arc/demo-data"
import { ChipGroup } from "@/registry/ui/chip-group"

const facets = facetTags.map((tag) => ({ value: tag, label: tag }))

export function Demo() {
  const [value, setValue] = React.useState(["clay", "glaze"])
  return (
    <div className="flex flex-col gap-8">
      <ChipGroup label={`Facetas de ${atelier.name}`} options={facets} value={value} onValueChange={setValue} maxVisible={6} />
      <StressCases
        empty={<ChipGroup label="Vacío" options={facets} value={[]} onValueChange={() => {}} />}
        long={<ChipGroup label="Larga" options={[{ value: "long", label: unbreakable }]} value={["long"]} onValueChange={() => {}} />}
        crowded={
          <ChipGroup
            label="Diez"
            options={people.map((person) => ({ value: person.id, label: person.name }))}
            value={["ines"]}
            onValueChange={() => {}}
          />
        }
      />
    </div>
  )
}
