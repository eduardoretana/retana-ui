import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Constructor de reglas",
  description: "Cuando, condiciones anidadas y entonces. La pieza no guarda sola.",
}

export default function Page() {
  return (
    <ExampleFrame
      size="wide"
      title="Constructor de reglas"
      description="Arma una guarda. El kind puede ser de WhatsApp o git.merge. En solo lectura no se edita."
    >
      <Demo />
    </ExampleFrame>
  )
}
