import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Base de conocimiento",
  description: "Ingesta de fuentes para RAG, con progreso, fragmentos y restablecer.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Base de conocimiento"
      description="Cada fuente se conecta, sincroniza y se puede desconectar. El anfitrión hace el trabajo. Restablecer pide confirmación."
      wide
    >
      <Demo />
    </ExampleFrame>
  )
}
