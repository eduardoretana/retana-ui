import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Líneas acopladas",
  description: "El punto se queda sobre cada línea. La leyenda aísla una serie.",
}

export default function Page() {
  return (
    <ExampleFrame title="Líneas acopladas" description="El punto se queda sobre cada línea. La leyenda aísla una serie.">
      <Demo />
    </ExampleFrame>
  )
}
