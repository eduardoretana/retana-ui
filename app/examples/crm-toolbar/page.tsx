import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra de empresas",
  description: "Búsqueda, segmentos y filtros de selección múltiple.",
}

export default function CrmToolbarPage() {
  return (
    <ExampleFrame
      wide
      title="Barra de empresas"
      description="Segmentos Todas, Activas, Prospectos e Inactivas. En un contenedor estrecho los filtros se abren en un panel."
    >
      <Demo />
    </ExampleFrame>
  )
}
