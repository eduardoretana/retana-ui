import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Plan contra lo real",
  description: "El viernes planeado contra los minutos que de verdad se fueron, y cómo se corre el cierre.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Plan contra lo real"
      description="La cotización salió antes y el anticipo se alargó. Los pasos de después se recorren. Adelantado cierra con ventaja."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
