import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Paleta de color",
  description: "Muestras que se copian al hacer clic.",
}

export default function ColorPalettePage() {
  return (
    <ExampleFrame title="Paleta de color" description="Un clic copia el valor. Este ejemplo usa los tokens del tema, no una paleta fija.">
      <Demo />
    </ExampleFrame>
  )
}
