import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Comparar imagen",
  description: "Un divisor que se arrastra entre el antes y el después.",
}

export default function ImageComparePage() {
  return (
    <ExampleFrame title="Comparar imagen" description="Arrastra en cualquier punto. Las flechas mueven el divisor un uno por ciento." wide>
      <Demo />
    </ExampleFrame>
  )
}
