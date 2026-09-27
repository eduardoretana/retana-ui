"use client"

import { ColorPalette } from "@/registry/ui/color-palette"

export function Demo() {
  return (
    <ColorPalette
      copyLabel="Copiar"
      copiedLabel="Copiado"
      className="max-w-sm grid-cols-3"
      swatches={[
        { id: "ink", label: "Tinta", value: "var(--foreground)" },
        { id: "paper", label: "Papel", value: "var(--background)" },
        { id: "mist", label: "Niebla", value: "var(--muted)" },
        { id: "line", label: "Línea", value: "var(--border)" },
        { id: "mark", label: "Marca", value: "var(--primary)" },
        { id: "alert", label: "Aviso", value: "var(--destructive)" },
      ]}
    />
  )
}
