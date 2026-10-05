import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Diálogo de empresa nueva",
  description: "Formulario con logo, secciones y validación.",
}

export default function CrmNewCompanyDialogPage() {
  return (
    <ExampleFrame
      title="Diálogo de empresa nueva"
      description="Identidad, relación y comercial. El logo acepta PNG, JPEG, WebP o GIF de hasta 2 MB."
    >
      <Demo />
    </ExampleFrame>
  )
}
