import type { Metadata } from "next"

import { ProposalPage, ProposalShellDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Cascarón de propuesta",
  description: "Barra lateral agrupada, búsqueda y acción del paso.",
}

export default function Page() {
  return (
    <ProposalPage title="Cascarón de propuesta" description="Barra lateral agrupada, búsqueda y acción del paso.">
      <ProposalShellDemo />
    </ProposalPage>
  )
}
