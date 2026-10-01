import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Hilo de comentarios",
  description: "Respuestas, reacciones, menciones, edición en línea y resolver.",
}

export default function CommentThreadPage() {
  return (
    <ExampleFrame title="Hilo de comentarios" description="Responde, reacciona, menciona a alguien del taller y marca el hilo como resuelto.">
      <Demo />
    </ExampleFrame>
  )
}
