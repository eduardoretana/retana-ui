import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Collage de demos",
  description: "Una rejilla de minidemos que se dibujan al entrar en pantalla.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Collage de demos" description="Una rejilla de minidemos que se dibujan al entrar en pantalla.">
      <Demo />
    </ExampleFrame>
  )
}
