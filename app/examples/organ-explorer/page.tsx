import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { OrganExplorer } from "@/registry/retana/blocks/organ-explorer"
import { heartModel } from "@/registry/retana/ui/organ-heart"

export const metadata: Metadata = {
  title: "Explorador de órgano",
  description: "Visor con panel anatómico acoplado o en hoja inferior en móvil.",
}

export default function Page() {
  return (
    <ExampleFrame title="Explorador de órgano" description="Visor con panel anatómico acoplado o en hoja inferior en móvil." size="desk">
      <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {heartModel.name}
        </h1>
        <p className="text-muted-foreground">
          Rotate the model, or open the anatomy panel to find and hide
          structures.
        </p>
      </div>
      <OrganExplorer model={heartModel} />
    </div>
    </ExampleFrame>
  )
}
