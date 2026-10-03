import type { Metadata } from "next"

import { ViewKanbanDemo } from "./demo"

export const metadata: Metadata = {
  title: "Kanban view",
  description: "Tablero por un campo de estado, con suma, arrastre y menú Mover a.",
}

export default function ViewKanbanPage() {
  return <ViewKanbanDemo />
}
