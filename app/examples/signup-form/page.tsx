import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Formulario de registro",
  description: "Alta con correo, contraseña y un paso de confirmación.",
}

export default function SignupFormPage() {
  return (
    <ExampleFrame title="Formulario de registro" description="El estudio crea la cuenta, elige actualizaciones y vuelve a empezar.">
      <Demo />
    </ExampleFrame>
  )
}
