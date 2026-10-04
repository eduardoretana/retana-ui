import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rejilla de capacidades",
  description: "Un informe local de lo que este navegador puede hacer.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Rejilla de capacidades" description="Un informe local de lo que este navegador puede hacer.">
      <Demo />
    </ExampleFrame>
  )
}
