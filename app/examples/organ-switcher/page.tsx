import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { OrganSwitcher } from "@/registry/retana/blocks/organ-switcher"
import { heartModel } from "@/registry/retana/ui/organ-heart"
import { kidneysModel } from "@/registry/retana/ui/organ-kidneys"
import { pancreasModel } from "@/registry/retana/ui/organ-pancreas"
import { stomachModel } from "@/registry/retana/ui/organ-stomach"

export const metadata: Metadata = {
  title: "Selector de órganos",
  description: "Un visor que cambia entre varios órganos desde un menú.",
}

export default function Page() {
  return (
    <ExampleFrame title="Selector de órganos" description="Un visor que cambia entre varios órganos desde un menú." size="desk">
      <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Organs</h1>
        <p className="text-muted-foreground">
          Pick an organ, then select a structure to learn about it.
        </p>
      </div>
      <OrganSwitcher
        models={[heartModel, kidneysModel, stomachModel, pancreasModel]}
      />
    </div>
    </ExampleFrame>
  )
}
