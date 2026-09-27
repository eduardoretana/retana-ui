"use client"

import { useState } from "react"

import { SortableList, type SortableListItem } from "@/registry/ui/sortable-list"

const seed: SortableListItem[] = [
  { id: "lumen", title: "App Lumen", meta: "Banca · 2025", thumbnailAlt: "Lumen" },
  { id: "norte", title: "Identidad Norte", meta: "Marca · 2024", thumbnailAlt: "Norte" },
  { id: "orion", title: "Orión viajes", meta: "Producto · 2026", thumbnailAlt: "Orión" },
  { id: "pulso", title: "Pulso salud", meta: "Datos · 2025", thumbnailAlt: "Pulso" },
]

export function SortableListDemo() {
  const [items, setItems] = useState(seed)
  const [fail, setFail] = useState(false)

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-4 bg-background p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Lista ordenable</h1>
        <p className="text-sm text-muted-foreground">
          Arrastra con el ratón o el teclado. Los botones mueven la fila arriba, abajo, al inicio
          o al final. Si el guardado falla, el orden vuelve atrás.
        </p>
      </header>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />
        Simular un error al guardar
      </label>
      <SortableList
        items={items}
        label="proyectos"
        editLabel="Editar"
        savedMessage="Orden guardado"
        errorMessage="No se pudo guardar el orden"
        onEdit={() => undefined}
        onReorder={async (ids) => {
          if (fail) throw new Error("El servidor rechazó el orden")
          const byId = new Map(items.map((item) => [item.id, item]))
          setItems(ids.map((id) => byId.get(id)).filter((item): item is SortableListItem => item != null))
        }}
      />
    </main>
  )
}
