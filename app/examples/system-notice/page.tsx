import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Aviso del hilo",
  description: "Una línea breve de estado dentro del hilo, no una burbuja.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Aviso del hilo" description="Una línea breve de estado dentro del hilo, no una burbuja.">
      <Demo />
    </ExampleFrame>
  )
}
