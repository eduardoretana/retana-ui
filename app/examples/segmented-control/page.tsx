import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Control segmentado",
  description: "Un conjunto pequeño de vistas relacionadas.",
}

export default function SegmentedControlPage() {
  return (
    <ExampleFrame title="Control segmentado" description="Las flechas mueven la selección. El resalte se desliza hasta la opción activa.">
      <Demo />
    </ExampleFrame>
  )
}
