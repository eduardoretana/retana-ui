import type { Metadata } from "next"

import { ProposalPage, ProposalEstimateDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Estimación y precio",
  description: "Horas contra el histórico y un desglose.",
}

export default function Page() {
  return (
    <ProposalPage title="Estimación y precio" description="Horas contra el histórico y un desglose.">
      <ProposalEstimateDemo />
    </ProposalPage>
  )
}
