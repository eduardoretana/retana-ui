import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Visor JSON",
  description: "Pliega ramas, busca, pagina listas largas y copia el valor o la ruta.",
}

export default function JsonViewerPage() {
  return (
    <ExampleFrame title="Visor JSON" description="Las flechas abren ramas. La búsqueda salta al dato y cada fila copia el valor o la ruta.">
      <Demo />
    </ExampleFrame>
  )
}
