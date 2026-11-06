import type { Metadata } from "next"
import { ExampleFrame } from "@/app/examples/example-frame"
import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Constructor de flujos",
  description: "Lienzo para un agente de mensajes. Datos inventados. Nada se publica solo.",
}

export default function Page() {
  return (
    <ExampleFrame size="desk" title="Constructor de flujos" description="Mensaje entrante, clasificación, guarda, aprobación y respuesta. El taller y las personas son inventados.">
      <Demo />
    </ExampleFrame>
  )
}
