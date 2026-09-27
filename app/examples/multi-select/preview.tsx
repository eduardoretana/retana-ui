"use client"

import { MultiSelect } from "@/registry/ui/multi-select"

export default function MultiSelectPreview() {
  return (
    <div className="bg-background p-3">
      <MultiSelect
        defaultValue={["norte"]}
        placeholder="Etiquetas"
        searchPlaceholder="Buscar"
        removeLabel="Quitar"
        options={[
          { value: "norte", label: "Clínica Norte" },
          { value: "bruma", label: "Estudio Bruma" },
          { value: "orilla", label: "Estudio Orilla" },
        ]}
      />
    </div>
  )
}
