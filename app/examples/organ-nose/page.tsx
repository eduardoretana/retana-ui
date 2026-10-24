import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Nose } from "@/registry/retana/ui/organ-nose"

export const metadata: Metadata = {
  title: "Nariz",
  description: "Nariz en 3D: 22 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Nariz" description="Nariz en 3D: 22 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Nose label="Nariz" /></div>
    </ExampleFrame>
  )
}
