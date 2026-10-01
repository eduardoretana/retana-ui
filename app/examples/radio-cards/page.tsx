import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjetas de opción",
  description: "El anillo se mueve de una tarjeta a otra.",
}

export default function RadioCardsPage() {
  return (
    <ExampleFrame title="Tarjetas de opción" description="Una sola selección. Las flechas saltan las tarjetas apagadas y el anillo sigue a la elegida.">
      <Demo />
    </ExampleFrame>
  )
}
