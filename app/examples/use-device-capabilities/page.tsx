import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Capacidades del dispositivo",
  description: "Hooks de capacidad, almacenamiento y red. No piden permiso ni envían nada.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Capacidades del dispositivo" description="Hooks de capacidad, almacenamiento y red. No piden permiso ni envían nada.">
      <Demo />
    </ExampleFrame>
  )
}
