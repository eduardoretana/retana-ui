import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Progreso de scroll",
  description: "Un valor de 0 a 1 ligado al scroll.",
}

export default function Page() {
  return (
    <ExampleFrame title="Progreso de scroll" description="El hook devuelve la posición del scroll como un valor de 0 a 1.">
      <Demo />
    </ExampleFrame>
  )
}
