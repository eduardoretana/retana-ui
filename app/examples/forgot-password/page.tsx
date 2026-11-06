import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Olvidé mi contraseña",
  description: "El aviso es el mismo si la cuenta existe o no.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Olvidé mi contraseña"
      description="Pides un enlace. La tarjeta no dice si el correo tiene cuenta. Español de México e inglés, en 390 px."
    >
      <Demo />
    </ExampleFrame>
  )
}
