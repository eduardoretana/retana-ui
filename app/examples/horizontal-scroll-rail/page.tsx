import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Riel horizontal",
  description: "El scroll vertical mueve una fila que se queda fija.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Riel horizontal"
      description="En una pantalla ancha, el scroll de la página mueve la fila. Si el movimiento está reducido, o la pantalla es estrecha, la fila se desplaza sola."
      wide
    >
      <Demo />
    </ExampleFrame>
  )
}
