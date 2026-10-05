import type { Metadata } from "next"

import { ProposalPage, ProposalDashboardDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Tablero de propuestas",
  description: "Cifras, pendientes, horas y actividad de un estudio ficticio.",
}

export default function Page() {
  return (
    <ProposalPage title="Tablero de propuestas" description="Cifras, pendientes, horas y actividad de un estudio ficticio.">
      <ProposalDashboardDemo />
    </ProposalPage>
  )
}
