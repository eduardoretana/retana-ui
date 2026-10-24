import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta destacada con acción",
  description: "Tarjeta alta con degradado del color de acento, número grande y botón píldora para crear.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta destacada con acción" description="Tarjeta alta con degradado del color de acento, número grande y botón píldora para crear.">
      <Demo />
    </ExampleFrame>
  )
}
