import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Bloque de código",
  description: "Código con resaltado, nombre de archivo, copia y números de línea.",
}

export default function CodeBlockPage() {
  return (
    <ExampleFrame title="Bloque de código" description="Resaltado con los tokens del tema: palabras clave, cadenas y comentarios. El archivo es de ejemplo.">
      <Demo />
    </ExampleFrame>
  )
}
