import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Contador animado",
  description: "Cifras que giran como un odómetro.",
}

export default function AnimatedCounterPage() {
  return (
    <ExampleFrame title="Contador animado" description="Cada cifra gira hacia el nuevo valor y el lector de pantalla oye el número entero.">
      <Demo />
    </ExampleFrame>
  )
}
