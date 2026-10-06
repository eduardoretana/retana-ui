import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { DocumentListDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Lista de documentos",
  description: "Grupos en modo revisión o lista de verificación.",
}

export default function Page() {
  return (
    <ExampleFrame title="Lista de documentos" description="Grupos en modo revisión o lista de verificación.">
      <Demo />
    </ExampleFrame>
  )
}
