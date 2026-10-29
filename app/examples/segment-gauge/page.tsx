import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra de uso",
  description: "El aviso sigue al puntero por los tramos y por lo que queda libre.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barra de uso" description="El aviso sigue al puntero por los tramos y por lo que queda libre.">
      <Demo />
    </ExampleFrame>
  )
}
