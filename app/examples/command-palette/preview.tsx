"use client"

import { CommandPalette } from "@/registry/ui/command-palette"

export default function CommandPalettePreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <CommandPalette
        className="w-full"
        label="Comandos"
        items={[
          { id: "kiln", label: "Bitácora", shortcut: "K" },
          { id: "glaze", label: "Esmalte" },
        ]}
      />
    </div>
  )
}
