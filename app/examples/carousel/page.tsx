import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Carrusel",
  description: "Diapositivas que se arrastran, se recorren con el teclado y rotan.",
}

export default function CarouselPage() {
  return (
    <ExampleFrame title="Carrusel" description="Arrastra en horizontal. Las flechas y los puntos eligen la diapositiva." wide>
      <Demo />
    </ExampleFrame>
  )
}
