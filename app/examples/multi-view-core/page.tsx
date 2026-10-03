import type { Metadata } from "next"

import { MultiViewCoreDemo } from "./demo"

export const metadata: Metadata = {
  title: "Multi-view core",
  description: "Ayudas puras de búsqueda, filtro, fechas y formato.",
}

export default function MultiViewCorePage() {
  return <MultiViewCoreDemo />
}
