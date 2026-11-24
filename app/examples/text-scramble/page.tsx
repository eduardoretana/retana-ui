import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto que se descifra",
  description: "Un título que se descifra una sola vez al entrar. Con movimiento reducido, el texto final aparece de inmediato.",
}

export default function TextScramblePage() {
  return (
    <ExampleFrame
      title="Texto que se descifra"
      description="Para un hero o el título de una página, una vez por visita. No va en listas, tablas, botones ni nada que se vea muchas veces al día. Cambia de escena para verlo de nuevo."
    >
      <Demo />
    </ExampleFrame>
  )
}
