import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Diaphragm } from "@/registry/retana/ui/organ-diaphragm"

export const metadata: Metadata = {
  title: "Diafragma",
  description: "Diafragma en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Diafragma" description="Diafragma en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Diaphragm label="Diafragma" /></div>
    </ExampleFrame>
  )
}
