import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lista escalonada",
  description: "Las filas entran y salen con un retraso que tiene tope.",
}

export default function StaggerListPage() {
  return (
    <ExampleFrame title="Lista escalonada" description="Al cambiar de día, lo que sale sube y lo que entra llega desde abajo.">
      <Demo />
    </ExampleFrame>
  )
}
