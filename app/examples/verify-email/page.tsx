import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Verificar correo",
  description: "Revisa el correo y reenvía cuando la espera termina.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Verificar correo"
      description="El mensaje pide revisar el correo. Reenviar espera un momento. El código es opcional y no dice si la cuenta existe."
    >
      <Demo />
    </ExampleFrame>
  )
}
