import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Estado vacío",
  description: "Un hueco con icono, texto y una acción.",
}

export default function EmptyStatePage() {
  return (
    <ExampleFrame title="Estado vacío" description="El icono y el texto cambian de altura en el mismo lugar.">
      <Demo />
    </ExampleFrame>
  )
}
