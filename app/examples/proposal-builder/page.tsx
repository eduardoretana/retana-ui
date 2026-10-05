import type { Metadata } from "next"

import { ProposalPage, ProposalBuilderDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Constructor de propuestas",
  description: "Del tablero al envío, con datos ficticios de Estudio Bruma.",
}

export default function Page() {
  return (
    <ProposalPage title="Constructor de propuestas" description="Del tablero al envío, con datos ficticios de Estudio Bruma.">
      <ProposalBuilderDemo />
    </ProposalPage>
  )
}
