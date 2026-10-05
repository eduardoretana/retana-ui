import type { Metadata } from "next"

import { ProposalPage, ProposalDiscoveryDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Descubrimiento",
  description: "Notas con marcas de tiempo y la grabación.",
}

export default function Page() {
  return (
    <ProposalPage title="Descubrimiento" description="Notas con marcas de tiempo y la grabación.">
      <ProposalDiscoveryDemo />
    </ProposalPage>
  )
}
