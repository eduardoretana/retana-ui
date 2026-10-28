import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Días hábiles",
  description: "Cuenta días de ausencia sin fines de semana ni festivos.",
}

export default function Page() {
  return (
    <ExampleFrame title="Días hábiles" description="El cálculo no conoce al taller. Los festivos de México son un calendario que el anfitrión puede cambiar.">
      <Demo />
    </ExampleFrame>
  )
}
