import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { AnatomyWorkspace } from "@/registry/retana/blocks/anatomy-workspace"
import { heartModel } from "@/registry/retana/ui/organ-heart"

export const metadata: Metadata = {
  title: "Espacio de trabajo anatómico",
  description: "Área completa con árbol lateral, visor y ficha de la estructura.",
}

export default function Page() {
  return (
    <ExampleFrame title="Espacio de trabajo anatómico" description="Área completa con árbol lateral, visor y ficha de la estructura." size="desk">
      <AnatomyWorkspace model={heartModel} />
    </ExampleFrame>
  )
}
