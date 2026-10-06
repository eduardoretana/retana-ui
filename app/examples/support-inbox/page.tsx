import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { SupportInboxDemo } from "./demo"

export const metadata: Metadata = {
  title: "Bandeja del taller",
  description: "Conversaciones de Estudio Bruma, con nota interna y ficha del contacto.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Bandeja del taller"
      description="Tres paneles para el correo del taller. Los nombres y los encargos son de Estudio Bruma, un taller ficticio."
    >
      <SupportInboxDemo />
    </DeskFrame>
  )
}
