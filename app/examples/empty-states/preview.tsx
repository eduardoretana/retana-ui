"use client"

import { EmptyStates, type EmptyScene } from "@/registry/blocks/empty-states"

const scenes: EmptyScene[] = [
  {
    id: "search",
    tab: "Sin resultados",
    art: "search",
    wait: 0,
    loading: "",
    idle: { title: "Nada para “gres”", line: "Dos filtros activos.", action: "Quitar filtros" },
    done: { title: "12 piezas", line: "Filtros quitados.", action: "Volver a filtrar" },
  },
  {
    id: "offline",
    tab: "Sin conexión",
    art: "offline",
    wait: 900,
    loading: "Buscando el taller…",
    idle: { title: "Sin conexión", line: "Las notas se quedan aquí.", action: "Reintentar" },
    done: { title: "En línea", line: "Tres notas sincronizadas.", action: "Cortar" },
  },
]

export default function EmptyStatesPreview() {
  return (
    <div className="bg-background p-3">
      <EmptyStates scenes={scenes} />
    </div>
  )
}
