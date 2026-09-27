import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Campo OTP",
  description: "Código de un solo uso con éxito, error y reenvío.",
}

export default function OtpFieldPage() {
  return (
    <ExampleFrame title="Campo OTP" description="Al completar los seis dígitos se valida. El reenvío espera una cuenta regresiva.">
      <Demo />
    </ExampleFrame>
  )
}
