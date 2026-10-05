import type { Metadata } from "next"

import { ProposalPage, ProposalAnalyzeDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Lectura de la llamada",
  description: "El borrador todavía no está listo.",
}

export default function Page() {
  return (
    <ProposalPage title="Lectura de la llamada" description="El borrador todavía no está listo.">
      <ProposalAnalyzeDemo />
    </ProposalPage>
  )
}
