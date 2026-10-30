import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mapa hexagonal",
  description: "Un panal. La leyenda resalta una serie y apaga el resto.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mapa hexagonal" description="Un panal. La leyenda resalta una serie y apaga el resto.">
      <Demo />
    </ExampleFrame>
  )
}
