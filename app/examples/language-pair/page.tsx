import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Par de idiomas",
  description: "Selectores de idioma de origen y destino, con intercambio.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Par de idiomas" description="Selectores de idioma de origen y destino, con intercambio.">
      <Demo />
    </ExampleFrame>
  )
}
