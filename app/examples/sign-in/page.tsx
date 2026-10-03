import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Inicio de sesión",
  description: "Correo, código de seis dígitos y pase.",
}

export default function SignInPage() {
  return (
    <ExampleFrame title="Inicio de sesión" description="El correo abre el código. El demo acepta 123456.">
      <Demo />
    </ExampleFrame>
  )
}
