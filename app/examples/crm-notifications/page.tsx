import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Avisos del CRM",
  description: "Popover de cabecera con avisos de la cartera.",
}

export default function CrmNotificationsPage() {
  return (
    <ExampleFrame
      title="Avisos del CRM"
      description="Lista corta en la cabecera. notification-center es la bandeja agrupada y notification-stack es la pila en profundidad."
    >
      <Demo />
    </ExampleFrame>
  )
}
