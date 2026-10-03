import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Menciones",
  description: "Personas con @ y canales con #, junto al cursor.",
}

export default function MentionInputPage() {
  return (
    <ExampleFrame title="Menciones" description="Escribe @ para una persona o # para un canal. La sugerencia aparece junto al cursor y el token se borra de un golpe.">
      <Demo />
    </ExampleFrame>
  )
}
