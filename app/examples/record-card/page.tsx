import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { RecordCardDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Tarjeta de registro",
  description: "Hero, media o ficha. La portada es un lavado del tema.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de registro" description="Hero, media o ficha. La portada es un lavado del tema.">
      <Demo />
    </ExampleFrame>
  )
}
