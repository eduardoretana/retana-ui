import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Qué camino",
  description: "El horno 2 no enciende y el viernes de Mariana Ruiz sigue abierto.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Qué camino"
      description="Elige un camino o escribe otro. La preferencia del agente no decide sola. En Error, la primera elección se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
