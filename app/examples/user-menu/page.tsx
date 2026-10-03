import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Menú de cuenta",
  description: "La cuenta, el tema y salir, en un panel o en una hoja inferior.",
}

export default function UserMenuPage() {
  return (
    <ExampleFrame title="Menú de cuenta" description="El tema y salir llegan como acciones. En una pantalla de 640px o menos, el mismo menú sube desde abajo.">
      <Demo />
    </ExampleFrame>
  )
}
