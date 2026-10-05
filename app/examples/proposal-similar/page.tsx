import type { Metadata } from "next"

import { ProposalPage, ProposalSimilarDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Proyectos similares",
  description: "Coincidencia, horas reales y una comparación.",
}

export default function Page() {
  return (
    <ProposalPage title="Proyectos similares" description="Coincidencia, horas reales y una comparación.">
      <ProposalSimilarDemo />
    </ProposalPage>
  )
}
