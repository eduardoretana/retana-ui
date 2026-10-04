import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Aprobación de herramienta",
  description: "Una puerta humana antes de ejecutar una herramienta, y luego un recibo breve.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Aprobación de herramienta" description="Una puerta humana antes de ejecutar una herramienta, y luego un recibo breve.">
      <Demo />
    </ExampleFrame>
  )
}
