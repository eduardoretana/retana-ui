import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Prostate } from "@/registry/retana/ui/organ-prostate"

export const metadata: Metadata = {
  title: "Próstata",
  description: "Próstata en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Próstata" description="Próstata en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Prostate label="Próstata" /></div>
    </ExampleFrame>
  )
}
