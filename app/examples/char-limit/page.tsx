import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Límite de caracteres",
  description: "Un anillo y un contador que aparecen cuando el texto se acerca al límite.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Límite de caracteres" description="Un anillo y un contador que aparecen cuando el texto se acerca al límite.">
      <Demo />
    </ExampleFrame>
  )
}
