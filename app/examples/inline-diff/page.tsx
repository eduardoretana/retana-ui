import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Diff en la prosa",
  description: "El texto del taller con las palabras que cambian, una por una.",
}

export default function Page() {
  return (
    <ExampleFrame title="Diff en la prosa" description="Acepta o rechaza cada cambio. Lo que sigue pendiente conserva la frase original." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
