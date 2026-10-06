import type { Metadata } from "next"

import { ContactPanelDemo } from "./demo"

export const metadata: Metadata = {
  title: "Ficha del contacto",
  description: "Pestañas de detalles y copiloto.",
}

export default function Page() {
  return <ContactPanelDemo />
}
