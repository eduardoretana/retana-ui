import type { Metadata } from "next"

import { ProposalPage, ProposalActivityDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Actividad del trato",
  description: "Lo que pasó, de lo nuevo a lo viejo.",
}

export default function Page() {
  return (
    <ProposalPage title="Actividad del trato" description="Lo que pasó, de lo nuevo a lo viejo.">
      <ProposalActivityDemo />
    </ProposalPage>
  )
}
