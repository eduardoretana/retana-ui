import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Flujo",
  description: "Al señalar un nodo se queda su ruta y el resto se atenúa.",
}

export default function Page() {
  return (
    <ExampleFrame title="Flujo" description="Al señalar un nodo se queda su ruta y el resto se atenúa.">
      <Demo />
    </ExampleFrame>
  )
}
