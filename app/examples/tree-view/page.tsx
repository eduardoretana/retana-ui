import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Árbol de archivos",
  description: "Carpetas que se abren con el teclado.",
}

export default function TreeViewPage() {
  return (
    <ExampleFrame title="Árbol de archivos" description="Las flechas abren una carpeta y mueven el foco entre filas.">
      <Demo />
    </ExampleFrame>
  )
}
