import type { Metadata } from "next"

import { ProposalPage, ProposalSendDemo } from "@/app/examples/proposal/screens"

export const metadata: Metadata = {
  title: "Enviar propuesta",
  description: "Destino, resumen y enlace de solo lectura.",
}

export default function Page() {
  return (
    <ProposalPage title="Enviar propuesta" description="Destino, resumen y enlace de solo lectura.">
      <ProposalSendDemo />
    </ProposalPage>
  )
}
