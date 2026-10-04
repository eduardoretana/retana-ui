import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Selector de micrófono",
  description: "Un selector de micrófono o cámara, con los estados de permiso.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Selector de micrófono" description="Un selector de micrófono o cámara, con los estados de permiso.">
      <Demo />
    </ExampleFrame>
  )
}
