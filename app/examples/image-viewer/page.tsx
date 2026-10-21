import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ImageViewerDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Visor de imágenes médicas",
  description: "Recorre cortes de TC o RM con ventana/nivel, zoom y desplazamiento. Incluye lector DICOM y fantoma de prueba.",
}

export default function Page() {
  return (
    <ExampleFrame title="Visor de imágenes médicas" description="Recorre cortes de TC o RM con ventana/nivel, zoom y desplazamiento. Incluye lector DICOM y fantoma de prueba." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
