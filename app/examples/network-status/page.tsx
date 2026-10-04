import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Estado de la red",
  description: "Un indicador de en línea o sin conexión, con un aviso opcional.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Estado de la red" description="Un indicador de en línea o sin conexión, con un aviso opcional.">
      <Demo />
    </ExampleFrame>
  )
}
