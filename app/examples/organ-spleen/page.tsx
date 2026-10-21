import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Spleen } from "@/registry/retana/ui/organ-spleen"

export const metadata: Metadata = {
  title: "Bazo",
  description: "Bazo en 3D: 9 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Bazo" description="Bazo en 3D: 9 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Spleen label="Bazo" /></div>
    </ExampleFrame>
  )
}
