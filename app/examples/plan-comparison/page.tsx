import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Comparación de planes",
  description: "Studio y Workshop, con filtro de diferencias.",
}

export default function PlanComparisonPage() {
  return (
    <ExampleFrame wide title="Comparación de planes" description="El precio sigue el periodo. El filtro deja solo lo que cambia entre planes.">
      <Demo />
    </ExampleFrame>
  )
}
