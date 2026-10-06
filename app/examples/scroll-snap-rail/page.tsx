import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Riel con snap",
  description: "Las secciones se alinean al soltar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Riel con snap" description="Scroll nativo. Al soltar, la sección o la tarjeta queda alineada.">
      <Demo />
    </ExampleFrame>
  )
}
