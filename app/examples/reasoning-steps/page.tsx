import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pasos de razonamiento",
  description: "Lista colapsable de pasos con estado y duración.",
}

export default function ReasoningStepsPage() {
  return (
    <ExampleFrame title="Pasos de razonamiento" description="Cada paso indica si está pendiente, en curso, hecho o con error, y cuánto tardó.">
      <Demo />
    </ExampleFrame>
  )
}
