import type { Metadata } from "next"

import { ProposalPage, ProposalOpportunityDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Nueva oportunidad",
  description: "Cliente, fuente y grabación antes de analizar.",
}

export default function Page() {
  return (
    <ProposalPage title="Nueva oportunidad" description="Cliente, fuente y grabación antes de analizar.">
      <ProposalOpportunityDemo />
    </ProposalPage>
  )
}
