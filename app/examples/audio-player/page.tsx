import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Reproductor de audio",
  description: "Un reproductor compacto con una barra que se recorre con el teclado.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Reproductor de audio" description="Un reproductor compacto con una barra que se recorre con el teclado.">
      <Demo />
    </ExampleFrame>
  )
}
