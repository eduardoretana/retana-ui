"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, facetTags, unbreakable } from "@/app/examples/arc/demo-data"
import { TagInput } from "@/registry/ui/tag-input"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <TagInput
        label={`Facetas de ${atelier.name}`}
        description={`${atelier.city} · ${atelier.kiln}`}
        placeholder="Agregar faceta"
        defaultValue={facetTags.slice(0, 3)}
        className="max-w-sm"
      />
      <StressCases
        empty={<TagInput label="Vacía" placeholder="Sin etiquetas" />}
        long={<TagInput label="Larga" defaultValue={[unbreakable]} description={unbreakable} />}
        crowded={<TagInput label="Diez" defaultValue={facetTags} />}
      />
    </div>
  )
}
