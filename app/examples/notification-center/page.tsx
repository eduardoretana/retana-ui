import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Centro de avisos",
  description: "Campana con avisos del estudio, leídos y descartados.",
}

export default function NotificationCenterPage() {
  return (
    <ExampleFrame title="Centro de avisos" description="Abre la campana, marca lo leído y descarta lo que ya no importa.">
      <Demo />
    </ExampleFrame>
  )
}
