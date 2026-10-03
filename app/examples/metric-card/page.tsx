import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de métrica",
  description: "Un número con su cambio y su contexto.",
}

export default function MetricCardPage() {
  return (
    <ExampleFrame title="Tarjeta de métrica" description="El valor y el cambio se sustituyen en su sitio, sin saltar el ancho.">
      <Demo />
    </ExampleFrame>
  )
}
