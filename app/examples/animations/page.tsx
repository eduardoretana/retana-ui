import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Animaciones",
  description: "Seis formas de nombrar el scroll, con demos propias.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Animaciones"
      description="Scroll-triggered, scroll-linked, parallax, sticky, snap y horizontal. El vocabulario es de la industria. Las demos son de este catálogo."
      wide
    >
      <Demo />
    </ExampleFrame>
  )
}
