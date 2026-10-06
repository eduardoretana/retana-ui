import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Revelado en cascada",
  description: "Los hijos entran uno después de otro.",
}

export default function Page() {
  return (
    <ExampleFrame title="Revelado en cascada" description="Cada hijo espera un poco al anterior. Con movimiento reducido, entran juntos.">
      <Demo />
    </ExampleFrame>
  )
}
