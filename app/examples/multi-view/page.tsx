import type { Metadata } from "next"

import { MultiViewDemo } from "./demo"

export const metadata: Metadata = {
  title: "Multi-view",
  description: "Una colección de registros en tabla, tablero, calendario, cronograma, lista y galería.",
}

export default function MultiViewPage() {
  return <MultiViewDemo />
}
