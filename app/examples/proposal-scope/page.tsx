import type { Metadata } from "next"

import { ProposalPage, ProposalScopeDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Lista de alcance",
  description: "Fases, origen de cada fila y el esfuerzo.",
}

export default function Page() {
  return (
    <ProposalPage title="Lista de alcance" description="Fases, origen de cada fila y el esfuerzo.">
      <ProposalScopeDemo />
    </ProposalPage>
  )
}
