import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra lateral flotante en píldora",
  description: "Barra vertical de íconos en píldora, con nombre accesible y página actual marcada.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barra lateral flotante en píldora" description="Barra vertical de íconos en píldora, con nombre accesible y página actual marcada.">
      <Demo />
    </ExampleFrame>
  )
}
