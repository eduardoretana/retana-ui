import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Registro de eventos",
  description: "Un registro de lo más nuevo a lo más viejo, con filtros, pausa y cargas expandibles.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Registro de eventos" description="Un registro de lo más nuevo a lo más viejo, con filtros, pausa y cargas expandibles.">
      <Demo />
    </ExampleFrame>
  )
}
