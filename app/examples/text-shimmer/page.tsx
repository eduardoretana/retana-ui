import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto con brillo",
  description: "Una luz recorre el estado mientras el trabajo sigue.",
}

export default function Page() {
  return (
    <ExampleFrame title="Texto con brillo" description="Una luz recorre el estado mientras el trabajo sigue.">
      <Demo />
    </ExampleFrame>
  )
}
