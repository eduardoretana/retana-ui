import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Revelar al desplazar",
  description: "La pieza entra al llegar al viewport.",
}

export default function Page() {
  return (
    <ExampleFrame title="Revelar al desplazar" description="Fade, slide o scale. Una vez. Con movimiento reducido, el contenido ya está.">
      <Demo />
    </ExampleFrame>
  )
}
