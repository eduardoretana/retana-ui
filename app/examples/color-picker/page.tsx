import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Selector de color",
  description: "Área de saturación, tono, alfa y campo hexadecimal.",
}

export default function ColorPickerPage() {
  return (
    <ExampleFrame title="Selector de color" description="El área se mueve con el puntero o las flechas. El tono y el alfa son controles deslizantes.">
      <Demo />
    </ExampleFrame>
  )
}
