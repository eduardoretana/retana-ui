import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Ear } from "@/registry/retana/ui/organ-ear"

export const metadata: Metadata = {
  title: "Oído",
  description: "Oído en 3D: 16 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Oído" description="Oído en 3D: 16 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Ear label="Oído" /></div>
    </ExampleFrame>
  )
}
