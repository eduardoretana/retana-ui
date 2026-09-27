import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Documento del agente",
  description: "Documento con ediciones propuestas que se aceptan o rechazan.",
}

export default function AiDocumentPage() {
  return (
    <ExampleFrame title="Documento del agente" description="Las propuestas quedan resaltadas. Aceptar las aplica y rechazar las descarta.">
      <Demo />
    </ExampleFrame>
  )
}
