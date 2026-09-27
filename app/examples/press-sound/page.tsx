import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Sonido al presionar",
  description: "Un clic sintetizado con Web Audio y un silencio global.",
}

export default function PressSoundPage() {
  return (
    <ExampleFrame title="Sonido al presionar" description="No hay archivos de audio. El silencio se recuerda en este navegador.">
      <Demo />
    </ExampleFrame>
  )
}
