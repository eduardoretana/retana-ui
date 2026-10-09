import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pasos fijos",
  description: "La columna visual se queda mientras los pasos cruzan el centro.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Pasos fijos"
      description="En una pantalla ancha, la visual se queda fija y cambia con el paso que cruza el centro. En estrecho, o con movimiento reducido, cada paso lleva la suya."
      wide
    >
      <Demo />
    </ExampleFrame>
  )
}
