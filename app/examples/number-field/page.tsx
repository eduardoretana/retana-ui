import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Campo numérico",
  description: "Dígitos que ruedan, con límites, teclado y frotado.",
}

export default function NumberFieldPage() {
  return (
    <ExampleFrame title="Campo numérico" description="Las flechas dan un paso, Mayús salta, y arrastrar la etiqueta frota el valor. En el límite el número se estira y vuelve.">
      <Demo />
    </ExampleFrame>
  )
}
