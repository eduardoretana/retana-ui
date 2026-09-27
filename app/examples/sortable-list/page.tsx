import type { Metadata } from "next"

import { SortableListDemo } from "./demo"

export const metadata: Metadata = {
  title: "Sortable list",
  description: "Lista arrastrable con anuncios para lector de pantalla y reorden optimista.",
}

export default function SortableListPage() {
  return <SortableListDemo />
}
