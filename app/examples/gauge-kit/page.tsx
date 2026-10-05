import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Medidores componibles",
  description: "Arcos, agujas, zonas, relojes y diales del kit de Gauge UI.",
}

export default function Page() {
  return (
    <ExampleFrame
      wide
      title="Medidores componibles"
      description="Cada plantilla es un dial armado con las mismas primitivas. Mueve el control: el arco, la aguja y el número viajan juntos."
    >
      <Demo />
    </ExampleFrame>
  )
}
