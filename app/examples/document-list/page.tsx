import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Demo } from "./demo"

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
