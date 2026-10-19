import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Analítica",
  description: "Indicadores, ingresos por canal, desglose, productos y tendencia.",
}

export default function ExamplePage() {
  return <Demo />
}
