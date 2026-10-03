import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Grupo de avatares",
  description: "Personas apiladas con el sobrante contado.",
}

export default function AvatarGroupPage() {
  return (
    <ExampleFrame title="Grupo de avatares" description="El equipo se apila y, si no caben, el sobrante entra desde abajo.">
      <Demo />
    </ExampleFrame>
  )
}
