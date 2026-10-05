import type { Metadata } from "next"

import { ProposalPage, ProposalWorkspaceDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Espacio del trato",
  description: "Migas, pestañas con subrayado y cambio de panel.",
}

export default function Page() {
  return (
    <ProposalPage title="Espacio del trato" description="Migas, pestañas con subrayado y cambio de panel.">
      <ProposalWorkspaceDemo />
    </ProposalPage>
  )
}
