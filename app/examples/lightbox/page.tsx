import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Visor de imágenes",
  description: "Visor a pantalla completa con navegación, zoom y teclado.",
}

export default function LightboxPage() {
  return (
    <ExampleFrame title="Visor de imágenes" description="Abre una miniatura. Flechas para cambiar, más y menos para el zoom, Escape para cerrar.">
      <Demo />
    </ExampleFrame>
  )
}
