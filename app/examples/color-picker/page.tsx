import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Selector de color",
  description: "Área de saturación, tono, alfa, campo HEX, RGB o HSL, copia, colores guardados y modo popover.",
}

export default function ColorPickerPage() {
  return (
    <ExampleFrame title="Selector de color" description="El área se mueve con el puntero o las flechas. Lo que escribes o pegas se valida antes de aplicarse. Los colores guardados se mueven con Alt + flechas o con sus botones.">
      <Demo />
    </ExampleFrame>
  )
}
