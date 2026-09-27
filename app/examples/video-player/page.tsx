import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Reproductor de video",
  description: "Controles propios y atajos de teclado.",
}

export default function VideoPlayerPage() {
  return (
    <ExampleFrame
      title="Reproductor de video"
      description="Espacio o K reproducen, las flechas buscan y cambian el volumen, M silencia y F pone pantalla completa. El clip es de dominio público (MDN, CC0)."
    >
      <Demo />
    </ExampleFrame>
  )
}
