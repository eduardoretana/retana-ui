import type { Metadata } from "next"
import Link from "next/link"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de verificación",
  description: "Código de un solo uso con cuenta regresiva, error y éxito.",
}

export default function TwoFactorCardPage() {
  return (
    <ExampleFrame
      title="Tarjeta de verificación"
      description="La tarjeta completa. El campo suelto sigue siendo otp-field."
    >
      <p className="max-w-xl text-sm text-muted-foreground">
        La inspiración visual es un reel de Design & Code With AV. No se usó su código. Los casos de estrés están en{" "}
        <Link href="/examples/two-factor-card/stress" className="underline underline-offset-2">
          320px, RTL y códigos largos
        </Link>
        .
      </p>
      <Demo />
    </ExampleFrame>
  )
}
