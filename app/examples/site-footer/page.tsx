import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pie de página",
  description: "Columnas, una fila breve, o el nombre del taller en grande.",
}

export default function SiteFooterPage() {
  return (
    <ExampleFrame wide title="Pie de página" description="El boletín valida el correo. La variante grande usa el nombre, no una marca ajena.">
      <Demo />
    </ExampleFrame>
  )
}
