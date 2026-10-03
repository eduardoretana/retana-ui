import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Novedades del estudio",
  description: "Notas de versión con filtro, meses y suscripción.",
}

export default function ChangelogFeedPage() {
  return (
    <ExampleFrame wide title="Novedades del estudio" description="Filtra por tipo, salta de mes y abre cada nota de Costa Atelier.">
      <Demo />
    </ExampleFrame>
  )
}
