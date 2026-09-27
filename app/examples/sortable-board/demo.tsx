"use client"

import { useState } from "react"
import { toast } from "sonner"

import { SortableBoard, type BoardItem } from "@/registry/ui/sortable-board"

const seed: BoardItem[] = [
  { id: "lumen", title: "App Lumen", categoryId: "producto", categoryTitle: "Producto", showOnHomepage: true },
  { id: "norte", title: "Identidad Norte", categoryId: "marca", categoryTitle: "Marca", showOnHomepage: false },
  { id: "orion", title: "Orión viajes", categoryId: "producto", categoryTitle: "Producto", showOnHomepage: true },
  { id: "kite", title: "Kite comercio", categoryId: "web", categoryTitle: "Sitios web", showOnHomepage: false },
  { id: "feria", title: "Feria logística", categoryId: "web", categoryTitle: "Sitios web", showOnHomepage: false },
]

export function SortableBoardDemo() {
  const [items, setItems] = useState(seed)

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-4 bg-background p-6">
      <header>
        <h1 className="text-xl font-semibold">Proyectos</h1>
        <p className="text-sm text-muted-foreground">
          Pestañas con recuento, búsqueda y vista de lista o cuadrícula. El interruptor de portada
          y el orden se aplican al momento.
        </p>
      </header>
      <SortableBoard
        items={items}
        categories={[
          { id: "producto", title: "Producto" },
          { id: "web", title: "Sitios web" },
          { id: "marca", title: "Marca" },
        ]}
        homepageLabel="Portada"
        searchLabel="Buscar proyectos"
        editLabel="Editar"
        emptyTitle="Ningún proyecto coincide"
        allLabel="Todos"
        uncategorizedLabel="Sin categoría"
        listLabel="Lista"
        gridLabel="Cuadrícula"
        viewLabel="Vista"
        orderHint="Arrastra el asa. Este orden es el del sitio."
        filteredHint="Al reordenar solo cambian los proyectos en pantalla. El resto se queda."
        savedMessage="Orden guardado"
        updateError="No se pudo actualizar"
        reorderLabel="Reordenar"
        dragInstructions="Pulsa Espacio, luego las flechas, y Espacio para soltar. Escape cancela."
        pickedUp="Recogido, posición"
        ofWord="de"
        overPlace="Sobre la posición"
        droppedAt="Soltado en la posición"
        dropped="Soltado."
        cancelled="Cancelado."
        onEdit={(id) => toast.message(`Editar ${items.find((item) => item.id === id)?.title ?? id}`)}
        onReorder={async (ids) => {
          const byId = new Map(items.map((item) => [item.id, item]))
          setItems(ids.map((id) => byId.get(id)).filter((item): item is BoardItem => item != null))
        }}
        onToggleHomepage={async (id, show) => {
          setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, showOnHomepage: show } : item)),
          )
        }}
      />
    </main>
  )
}
