import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cabecera",
  description: "Barra fija que se vuelve sólida al desplazar y un menú en pantallas estrechas.",
}

export default function SiteHeaderPage() {
  return (
    <ExampleFrame wide title="Cabecera" description="Se pega arriba, se vuelve sólida al bajar y abre una hoja en el teléfono.">
      <Demo />
    </ExampleFrame>
  )
}
