import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Generación de imagen",
  description: "Marco que muestra progreso y luego revela la imagen.",
}

export default function ImageGenerationPage() {
  return (
    <ExampleFrame title="Generación de imagen" description="Mientras se genera hay un velo y una barra. Al terminar, la imagen aparece con un fundido.">
      <Demo />
    </ExampleFrame>
  )
}
