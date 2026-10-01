import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Editor de texto",
  description: "Markdown al escribir, barra flotante y menú con la barra.",
}

export default function RichTextEditorPage() {
  return (
    <ExampleFrame title="Editor de texto" description="Escribe # y un espacio para un título, selecciona para la barra, o / para bloques. Sale HTML y Markdown." wide>
      <Demo />
    </ExampleFrame>
  )
}
