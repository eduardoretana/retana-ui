import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Agenda con carrusel de días",
  description: "Días en píldoras con flechas del teclado y la próxima cita en una tarjeta oscura con participantes.",
}

export default function Page() {
  return (
    <ExampleFrame title="Agenda con carrusel de días" description="Días en píldoras con flechas del teclado y la próxima cita en una tarjeta oscura con participantes.">
      <Demo />
    </ExampleFrame>
  )
}
