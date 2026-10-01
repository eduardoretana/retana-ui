import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Título al entrar",
  description: "El título se revela cuando entra en la vista.",
}

export default function Page() {
  return (
    <ExampleFrame title="Título al entrar" description="El título se revela cuando entra en la vista.">
      <Demo />
    </ExampleFrame>
  )
}
