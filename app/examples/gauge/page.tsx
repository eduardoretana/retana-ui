import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Medidor",
  description: "Un anillo que nombra el estado del valor.",
}

export default function GaugePage() {
  return (
    <ExampleFrame title="Medidor" description="El anillo se llena hasta el valor y el texto dice en qué tramo está.">
      <Demo />
    </ExampleFrame>
  )
}
