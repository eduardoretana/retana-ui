import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Selector de hora",
  description: "La hora elegida rueda y el menú se centra en ella.",
}

export default function TimePickerPage() {
  return (
    <ExampleFrame title="Selector de hora" description="El valor rueda hacia arriba o hacia abajo según la hora nueva. Las flechas recorren la lista.">
      <Demo />
    </ExampleFrame>
  )
}
