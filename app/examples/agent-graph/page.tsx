import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Red de agentes",
  description: "Quién llama a quién en el pedido del cobalto, y qué enlace está bloqueado.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Red de agentes"
      description="Mariana pide, Bruma reparte, Horno archiva y el correo de Caja está bloqueado. No es el árbol de quién lanzó a quién."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
