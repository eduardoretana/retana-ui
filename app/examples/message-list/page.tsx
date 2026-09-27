import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lista de mensajes",
  description: "Contenedor que sigue el último mensaje y ofrece volver al final.",
}

export default function MessageListPage() {
  return (
    <ExampleFrame
      title="Lista de mensajes"
      description="Si estás abajo, los mensajes nuevos entran en vista. Si subes, aparece el botón para volver al final."
    >
      <Demo />
    </ExampleFrame>
  )
}
