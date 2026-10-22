import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Navegación superior en píldora",
  description: "Menú centrado en píldora con indicador que se desliza, búsqueda, avisos y avatar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Navegación superior en píldora" description="Menú centrado en píldora con indicador que se desliza, búsqueda, avisos y avatar.">
      <Demo />
    </ExampleFrame>
  )
}
