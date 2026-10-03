import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Edición en línea",
  description: "El texto se vuelve un campo en el mismo sitio.",
}

export default function InlineEditPage() {
  return (
    <ExampleFrame title="Edición en línea" description="Enter guarda y Escape deshace. Si el guardado falla, vuelve el último valor.">
      <Demo />
    </ExampleFrame>
  )
}
