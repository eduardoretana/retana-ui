import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto con entidades",
  description: "Resaltes, máscaras o fichas de redacción para tramos anotados.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Texto con entidades" description="Resaltes, máscaras o fichas de redacción para tramos anotados.">
      <Demo />
    </ExampleFrame>
  )
}
