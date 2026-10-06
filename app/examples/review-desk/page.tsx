import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ReviewDeskDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Mesa de revisión",
  description: "El mismo bloque con tres presets: permisos, ventas y crédito.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mesa de revisión" description="El mismo bloque con tres presets: permisos, ventas y crédito." size="desk">
      <Demo />
    </ExampleFrame>
  )
}
