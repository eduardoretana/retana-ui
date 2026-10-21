import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Vestibular } from "@/registry/retana/ui/organ-vestibular"

export const metadata: Metadata = {
  title: "Sistema vestibular",
  description: "Sistema vestibular en 3D: 6 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Sistema vestibular" description="Sistema vestibular en 3D: 6 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Vestibular label="Sistema vestibular" /></div>
    </ExampleFrame>
  )
}
