import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Teléfono",
  description: "País, formato nacional y salida en E.164.",
}

export default function PhoneInputPage() {
  return (
    <ExampleFrame title="Teléfono" description="Elige el país, escribe el número y el valor sale en E.164. Pegar un número internacional cambia el país.">
      <Demo />
    </ExampleFrame>
  )
}
