import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Solicitud de ausencia",
  description: "Tipo, rango, notas y el resumen de días contra el saldo.",
}

export default function Page() {
  return (
    <ExampleFrame title="Solicitud de ausencia" description="Cuenta solo días hábiles. Un festivo dentro del rango no se descuenta del saldo.">
      <Demo />
    </ExampleFrame>
  )
}
