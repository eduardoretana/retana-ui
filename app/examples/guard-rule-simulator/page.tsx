import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Simulador de reglas",
  description: "Prueba una acción ficticia contra el ruleset y lee la decisión y la traza.",
}

export default function Page() {
  return (
    <ExampleFrame size="wide" title="Simulador de reglas" description="WhatsApp sintético y un merge git.merge. Si falta un dato, no permite.">
      <Demo />
    </ExampleFrame>
  )
}
