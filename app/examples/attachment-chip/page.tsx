import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Chip de adjunto",
  description: "Chip de archivo con icono, tamaño, vista previa y quitar.",
}

export default function AttachmentChipPage() {
  return (
    <ExampleFrame title="Chip de adjunto" description="El icono cambia con el tipo. Las imágenes muestran una miniatura.">
      <Demo />
    </ExampleFrame>
  )
}
