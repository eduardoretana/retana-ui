import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Variantes de respuesta",
  description: "Pasa entre las variantes regeneradas de una misma respuesta.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Variantes de respuesta" description="Pasa entre las variantes regeneradas de una misma respuesta.">
      <Demo />
    </ExampleFrame>
  )
}
