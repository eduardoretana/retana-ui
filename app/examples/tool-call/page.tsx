import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Llamada de herramienta",
  description: "Una invocación de herramienta con estado, parámetros y resultado o error.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Llamada de herramienta" description="Una invocación de herramienta con estado, parámetros y resultado o error.">
      <Demo />
    </ExampleFrame>
  )
}
