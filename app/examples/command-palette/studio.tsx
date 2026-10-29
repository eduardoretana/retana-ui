"use client"

import { useState } from "react"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { CommandPalette } from "@/registry/ui/command-palette"

const items = [
  { id: "kiln", label: "Abrir bitácora del horno", group: "Taller", shortcut: "K" },
  { id: "glaze", label: "Mezclar esmalte", group: "Taller" },
  { id: "ship", label: "Preparar envío", group: "Taller" },
]

export function Demo() {
  const [picked, setPicked] = useState("Ninguno")
  return (
    <div className="flex flex-col gap-6">
      <CommandPalette items={items} label="Comandos" onSelect={(item) => setPicked(item.label)} />
      <p className="text-sm text-muted-foreground">Elegido: {picked}</p>
      <StressCases
        empty={<CommandPalette items={[]} label="Vacío" />}
        long={<CommandPalette items={[{ id: "long", label: unbreakable }]} label="Largo" />}
        crowded={
          <CommandPalette
            label="Diez"
            items={Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: `Pieza ${index + 1}`, group: "Horno" }))}
          />
        }
      />
    </div>
  )
}
