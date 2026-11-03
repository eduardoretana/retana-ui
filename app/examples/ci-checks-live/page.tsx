import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "CI Checks Live",
  description: "Demo con datos ficticios. El token no sale del servidor.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      size="wide"
      title="CI Checks Live"
      description="Esta vista usa un transporte en memoria. No llama a GitHub y no tiene token."
    >
      <Demo />
    </ExampleFrame>
  )
}
