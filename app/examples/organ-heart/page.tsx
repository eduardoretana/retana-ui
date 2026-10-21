import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Heart } from "@/registry/retana/ui/organ-heart"

export const metadata: Metadata = {
  title: "Corazón",
  description: "Corazón en 3D: 11 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Corazón" description="Corazón en 3D: 11 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Heart label="Corazón" /></div>
    </ExampleFrame>
  )
}
