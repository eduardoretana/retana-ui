import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Bandeja de mensajes",
  description: "Lista, hilo y ficha de un cliente ficticio. Las sugerencias no se envían solas.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Bandeja de mensajes"
      description="Taller Ámbar en León, y la escena Cenit con datos ficticios. Nada sale sin que alguien lo apruebe."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
