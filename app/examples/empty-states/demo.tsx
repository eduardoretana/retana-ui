"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { EmptyStates, type EmptyScene } from "@/registry/blocks/empty-states"

const scenes: EmptyScene[] = [
  {
    id: "search",
    tab: "Sin resultados",
    art: "search",
    wait: 0,
    loading: "",
    idle: { title: `Nada para “${atelier.kiln}”`, line: "Dos filtros: gres y archivo.", action: "Quitar filtros" },
    done: { title: "12 piezas en el estante", line: "Filtros quitados. Entra todo el barro y todo el estado.", action: "Volver a filtrar" },
  },
  {
    id: "offline",
    tab: "Sin conexión",
    art: "offline",
    wait: 900,
    loading: "Buscando el taller…",
    idle: { title: "Sin conexión", line: "Las notas del horno se quedan en este aparato.", action: "Reintentar" },
    done: { title: "Otra vez en línea", line: `Tres notas llegaron a ${atelier.city}.`, action: "Cortar" },
  },
  {
    id: "inbox",
    tab: "Al día",
    art: "inbox",
    wait: 700,
    loading: "Buscando correo…",
    idle: { title: "Bandeja al día", line: `Nada nuevo en ${atelier.email}.`, action: "Buscar correo" },
    done: { title: "Sigue al día", line: "Nada desde el horno de la mañana.", action: "Buscar otra vez" },
  },
  {
    id: "map",
    tab: "No está",
    art: "map",
    wait: 800,
    loading: "Buscando en el archivo…",
    idle: { title: "Página no encontrada", line: "El enlace al archivo del 2023 se rompió.", action: "Buscar la página" },
    done: { title: "Está en el archivo", line: "El lote se movió en marzo.", action: "Ver el enlace roto" },
  },
]

const blank: EmptyScene = {
  id: "blank",
  tab: "Vacío",
  art: "search",
  wait: 0,
  loading: "",
  idle: { title: "", line: "", action: "Acción" },
  done: { title: "Listo", line: "", action: "Volver" },
}

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <EmptyStates scenes={scenes} />
      <StressCases
        empty={<EmptyStates scenes={[blank]} />}
        long={<EmptyStates scenes={[{ ...scenes[0], idle: { ...scenes[0].idle, title: unbreakable } }]} />}
        crowded={<EmptyStates scenes={Array.from({ length: 10 }, (_, index) => ({ ...scenes[index % scenes.length], id: `scene-${index}`, tab: `Escena ${index + 1}` }))} />}
      />
    </div>
  )
}
