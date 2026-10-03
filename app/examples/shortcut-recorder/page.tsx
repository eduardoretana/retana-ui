import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Atajo de teclado",
  description: "Graba una combinación y consulta la lista.",
}

export default function ShortcutRecorderPage() {
  return (
    <ExampleFrame title="Atajo de teclado" description="Pulsa el campo y la combinación. Si ya está tomada, el campo avisa antes de usarla.">
      <Demo />
    </ExampleFrame>
  )
}
