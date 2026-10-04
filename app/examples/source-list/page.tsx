import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lista de fuentes",
  description: "Una lista plegable de fuentes numeradas, con extracto.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Lista de fuentes" description="Una lista plegable de fuentes numeradas, con extracto.">
      <Demo />
    </ExampleFrame>
  )
}
