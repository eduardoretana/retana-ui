import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cursores en vivo",
  description: "Cursores con nombre, posicionados dentro del contenedor.",
}

export default function LiveCursorsPage() {
  return (
    <ExampleFrame title="Cursores en vivo" description="Las coordenadas son relativas al marco. Con movimiento reducido el cursor salta, no se desliza.">
      <Demo />
    </ExampleFrame>
  )
}
