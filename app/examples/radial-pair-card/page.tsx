import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Par de anillos radiales",
  description: "Dos anillos de porcentaje lado a lado, como tiempo de respuesta y resolución. El trazo se dibuja al entrar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Par de anillos radiales" description="Dos anillos de porcentaje lado a lado, como tiempo de respuesta y resolución. El trazo se dibuja al entrar.">
      <Demo />
    </ExampleFrame>
  )
}
