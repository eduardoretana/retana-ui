import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Petición de permiso",
  description: "Bruma pide mandar el correo a Celaya, una vez, un rato o siempre.",
}

export default function Page() {
  return (
    <ExampleFrame title="Petición de permiso" description="Se ve quién pide, por qué y qué va a pasar antes de permitir." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
