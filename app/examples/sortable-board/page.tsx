import type { Metadata } from "next"

import { SortableBoardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Sortable board",
  description: "Tablero de proyectos con categorías, búsqueda y visibilidad en portada.",
}

export default function SortableBoardPage() {
  return <SortableBoardDemo />
}
