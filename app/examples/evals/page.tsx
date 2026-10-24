import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Evaluaciones",
  description: "Indicadores frente a la versión anterior, gráfica, diff y casos.",
}

export default function ExamplePage() {
  return <Demo />
}
