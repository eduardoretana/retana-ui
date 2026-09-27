"use client"

import { ColorPalette } from "@/registry/ui/color-palette"

export default function ColorPalettePreview() {
  return (
    <div className="bg-background p-3">
      <ColorPalette
        copyLabel="Copiar"
        copiedLabel="Copiado"
        swatches={[
          { id: "ink", label: "Tinta", value: "var(--foreground)" },
          { id: "paper", label: "Papel", value: "var(--muted)" },
          { id: "line", label: "Línea", value: "var(--border)" },
          { id: "mark", label: "Marca", value: "var(--primary)" },
        ]}
      />
    </div>
  )
}
