import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ficha de empresa",
  description: "Panel lateral con puntuación, salud del pipeline y tendencia.",
}

export default function CrmCompanyDetailPage() {
  return (
    <ExampleFrame
      title="Ficha de empresa"
      description="Se abre al lado sin cambiar de ruta. La puntuación, el medidor y la tendencia usan piezas que ya están en el catálogo."
    >
      <Demo />
    </ExampleFrame>
  )
}
