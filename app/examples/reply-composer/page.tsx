import type { Metadata } from "next"

import { ReplyComposerDemo } from "./demo"

export const metadata: Metadata = {
  title: "Respuesta del taller",
  description: "Compositor con respuesta, nota interna y atajo de envío.",
}

export default function Page() {
  return <ReplyComposerDemo />
}
