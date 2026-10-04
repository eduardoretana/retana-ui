import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Grafo de fuerzas",
  description: "Un grafo de nodos en SVG, con una lista accesible.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Grafo de fuerzas" description="Un grafo de nodos en SVG, con una lista accesible.">
      <Demo />
    </ExampleFrame>
  )
}
