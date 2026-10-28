import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Borrador de correo",
  description: "La carta a Celaya, con destinatario, tono y adjunto, antes de enviarla.",
}

export default function Page() {
  return (
    <ExampleFrame title="Borrador de correo" description="Cambia el destinatario y el tono, quita el adjunto, envía o descarta." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
