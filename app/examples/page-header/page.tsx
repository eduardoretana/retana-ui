import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Encabezado de página",
  description: "Proyecto del estudio con pestañas, seguimiento y avisos.",
}

export default function PageHeaderPage() {
  return (
    <ExampleFrame wide title="Encabezado de página" description="El horno condensa al bajar, pliega acciones y abre incidencias, notas y archivos.">
      <Demo />
    </ExampleFrame>
  )
}
