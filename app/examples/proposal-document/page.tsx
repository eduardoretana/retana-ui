import type { Metadata } from "next"

import { ProposalPage, ProposalDocumentDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Editor de propuesta",
  description: "Secciones, documento y lista previa al envío.",
}

export default function Page() {
  return (
    <ProposalPage title="Editor de propuesta" description="Secciones, documento y lista previa al envío.">
      <ProposalDocumentDemo />
    </ProposalPage>
  )
}
