import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Islas de navegación",
  description: "Riel, isla expandida y submenú en árbol para un CRM. El anfitrión guarda el equipo, la sección y si está contraída.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Islas de navegación"
      description="Contraer el panel, pasar el puntero por el riel o abrir el menú de Camila Ortega. En el rol de agente se ocultan automatizaciones y favoritos."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
