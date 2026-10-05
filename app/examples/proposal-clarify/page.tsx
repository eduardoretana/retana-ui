import type { Metadata } from "next"

import { ProposalPage, ProposalClarifyDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Preguntas de aclaración",
  description: "Las respuestas mueven horas, precio y plazo.",
}

export default function Page() {
  return (
    <ProposalPage title="Preguntas de aclaración" description="Las respuestas mueven horas, precio y plazo.">
      <ProposalClarifyDemo />
    </ProposalPage>
  )
}
