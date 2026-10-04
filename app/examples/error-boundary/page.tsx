import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Límite de error",
  description: "Atrapa el error de una sección y ofrece intentarlo de nuevo.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Límite de error" description="Atrapa el error de una sección y ofrece intentarlo de nuevo.">
      <Demo />
    </ExampleFrame>
  )
}
