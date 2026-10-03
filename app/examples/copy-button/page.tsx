import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Botón copiar",
  description: "Copia un valor y confirma en el mismo botón.",
}

export default function CopyButtonPage() {
  return (
    <ExampleFrame title="Botón copiar" description="El icono y las letras cambian a Copiado sin mover el resto de la fila.">
      <Demo />
    </ExampleFrame>
  )
}
