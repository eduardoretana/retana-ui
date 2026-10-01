import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mapa de rectángulos",
  description: "Un clic entra en la rama. La miga vuelve atrás.",
}

export default function TreemapPage() {
  return (
    <ExampleFrame title="Mapa de rectángulos" description="Las flechas saltan entre rectángulos. Enter entra y Escape sale." wide>
      <Demo />
    </ExampleFrame>
  )
}
