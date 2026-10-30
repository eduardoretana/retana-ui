import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rangos horizontales",
  description: "Barras flotantes sobre una escala común.",
}

export default function Page() {
  return (
    <ExampleFrame title="Rangos horizontales" description="Barras flotantes sobre una escala común.">
      <Demo />
    </ExampleFrame>
  )
}
