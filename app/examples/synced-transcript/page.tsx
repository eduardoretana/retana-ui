import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Transcripción sincronizada",
  description: "Una transcripción que resalta la palabra del instante actual.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Transcripción sincronizada" description="Una transcripción que resalta la palabra del instante actual.">
      <Demo />
    </ExampleFrame>
  )
}
