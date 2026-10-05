import type { Metadata } from "next"

import { ProposalPage, ProposalSowDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Orden de trabajo",
  description: "Partes, cláusulas y acuse.",
}

export default function Page() {
  return (
    <ProposalPage title="Orden de trabajo" description="Partes, cláusulas y acuse.">
      <ProposalSowDemo />
    </ProposalPage>
  )
}
