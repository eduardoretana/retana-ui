import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla de empresas",
  description: "Tabla de empresas con orden, selección, puntuación, chispa de actividad y CSV.",
}

export default function CrmCompaniesTablePage() {
  return (
    <ExampleFrame
      wide
      title="Tabla de empresas"
      description="Orden, selección, encabezado fijo y un helper de CSV. crm-table sigue siendo la ficha de contacto fija."
    >
      <Demo />
    </ExampleFrame>
  )
}
