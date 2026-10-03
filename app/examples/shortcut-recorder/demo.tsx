"use client"

import { useState } from "react"

import { unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { ShortcutList, ShortcutRecorder } from "@/registry/ui/shortcut-recorder"

const groups = [
  {
    label: "Taller",
    items: [
      { label: "Guardar ficha", shortcut: "mod+s" },
      { label: "Buscar esmalte", shortcut: "mod+k" },
      { label: "Nueva nota", shortcut: "mod+n" },
    ],
  },
]

export function Demo() {
  const [shortcut, setShortcut] = useState<string | null>("mod+s")
  return (
    <div className="flex max-w-md flex-col gap-8">
      <ShortcutRecorder
        label="Guardar ficha"
        description="Requiere ⌘, Ctrl u Opción."
        value={shortcut}
        onValueChange={(next) => setShortcut(next)}
        bindings={[{ shortcut: "mod+k", label: "Buscar esmalte" }]}
        platform="mac"
      />
      <ShortcutList label="Atajos del taller" groups={groups} platform="mac" />
      <StressCases
        empty={<ShortcutRecorder label="Vacío" platform="mac" />}
        long={<ShortcutRecorder label="Largo" description={unbreakable} defaultValue="mod+shift+k" platform="mac" />}
        crowded={
          <ShortcutList
            platform="mac"
            searchable={false}
            groups={[{
              label: "Diez",
              items: Array.from({ length: 10 }, (_, index) => ({ label: `Acción ${index + 1}`, shortcut: `mod+${index === 9 ? "0" : String(index + 1)}` })),
            }]}
          />
        }
      />
    </div>
  )
}
