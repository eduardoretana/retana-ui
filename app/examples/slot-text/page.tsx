import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto de rodillo",
  description: "Cifras y letras que giran hasta el nuevo valor.",
}

export default function SlotTextPage() {
  return (
    <ExampleFrame title="Texto de rodillo" description="Cada carácter es un rodillo. Los dígitos cuentan en la dirección del cambio.">
      <Demo />
    </ExampleFrame>
  )
}
