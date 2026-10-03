import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pila de avisos",
  description: "Avisos propios, apilados, que se deslizan para cerrarse.",
}

export default function ToastStackPage() {
  return (
    <ExampleFrame title="Pila de avisos" description="No usa Sonner. El aviso sube, se apila y se cierra deslizando a la derecha.">
      <Demo />
    </ExampleFrame>
  )
}
