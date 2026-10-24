import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ancho mínimo",
  description: "Verdadero cuando el viewport alcanza un ancho en píxeles.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Ancho mínimo"
      description="El primer render usa el layout estrecho. Después, el hook sigue el viewport. Lo comparten el riel horizontal y los pasos fijos."
    >
      <Demo />
    </ExampleFrame>
  )
}
