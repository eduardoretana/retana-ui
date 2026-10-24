import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Appendix } from "@/registry/retana/ui/organ-appendix"

export const metadata: Metadata = {
  title: "Apéndice",
  description: "Apéndice en 3D: 7 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Apéndice" description="Apéndice en 3D: 7 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Appendix label="Apéndice" /></div>
    </ExampleFrame>
  )
}
