import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Plan con control",
  description: "Al arrastrar se actualizan el porcentaje, el relleno y el total.",
}

export default function Page() {
  return (
    <ExampleFrame title="Plan con control" description="Al arrastrar se actualizan el porcentaje, el relleno y el total.">
      <Demo />
    </ExampleFrame>
  )
}
