import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Avatares de presencia",
  description: "Pila de avatares con desborde y agentes agrupados.",
}

export default function PresenceAvatarsPage() {
  return (
    <ExampleFrame title="Avatares de presencia" description="Los agentes se agrupan en un solo avatar. El resto desborda en +N.">
      <Demo />
    </ExampleFrame>
  )
}
