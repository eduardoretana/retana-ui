import type { Metadata } from "next"

import { ProposalPage, ProposalRisksDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Riesgos",
  description: "Plazo pedido contra el histórico y la aprobación.",
}

export default function Page() {
  return (
    <ProposalPage title="Riesgos" description="Plazo pedido contra el histórico y la aprobación.">
      <ProposalRisksDemo />
    </ProposalPage>
  )
}
