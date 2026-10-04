import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Sugerencias",
  description: "Una fila de fichas que rellena el compositor.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Sugerencias" description="Una fila de fichas que rellena el compositor.">
      <Demo />
    </ExampleFrame>
  )
}
