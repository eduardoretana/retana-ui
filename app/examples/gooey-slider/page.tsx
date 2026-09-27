import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Control viscoso",
  description: "Slider con un rastro orgánico al arrastrar.",
}

export default function GooeySliderPage() {
  return (
    <ExampleFrame title="Control viscoso" description="El pulgar del slider sigue siendo el control accesible. El rastro visual se estira al arrastrar.">
      <Demo />
    </ExampleFrame>
  )
}
