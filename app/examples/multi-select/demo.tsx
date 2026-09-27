"use client"

import { useState } from "react"

import { MultiSelect } from "@/registry/ui/multi-select"

export function Demo() {
  const [value, setValue] = useState<string[]>(["bruma"])

  return (
    <MultiSelect
      value={value}
      onValueChange={setValue}
      creatable
      placeholder="Elige expedientes"
      searchPlaceholder="Buscar o crear"
      emptyLabel="Sin resultados"
      createLabel="Crear"
      removeLabel="Quitar"
      options={[
        { value: "bruma", label: "Estudio Bruma" },
        { value: "norte", label: "Clínica Norte" },
        { value: "orilla", label: "Estudio Orilla" },
        { value: "calamo", label: "Taller Cálamo" },
      ]}
    />
  )
}
