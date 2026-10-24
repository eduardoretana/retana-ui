import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { MoleculeViewerDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Visor de moléculas",
  description: "Carga una estructura PDB o mmCIF y explórala como cartoon, bolas y varillas o esferas.",
}

export default function Page() {
  return (
    <ExampleFrame title="Visor de moléculas" description="Carga una estructura PDB o mmCIF y explórala como cartoon, bolas y varillas o esferas." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
