import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Intestines } from "@/registry/retana/ui/organ-intestines"

export const metadata: Metadata = {
  title: "Intestinos",
  description: "Intestinos en 3D: 11 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Intestinos" description="Intestinos en 3D: 11 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Intestines label="Intestinos" /></div>
    </ExampleFrame>
  )
}
