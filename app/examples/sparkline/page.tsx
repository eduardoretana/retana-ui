import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Minigráfico",
  description: "Una línea que se recorre con el puntero o el teclado.",
}

export default function SparklinePage() {
  return (
    <ExampleFrame title="Minigráfico" description="La línea se dibuja al entrar. Las flechas recorren cada punto.">
      <Demo />
    </ExampleFrame>
  )
}
