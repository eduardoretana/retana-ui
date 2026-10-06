import type { Metadata } from "next"

import { TicketPropertiesDemo } from "./demo"

export const metadata: Metadata = {
  title: "Propiedades de la pieza",
  description: "Estado, prioridad, fecha vencida y etiquetas.",
}

export default function Page() {
  return <TicketPropertiesDemo />
}
