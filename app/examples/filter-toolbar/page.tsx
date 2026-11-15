import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra de filtros",
  description: "Chips activos y un menú para añadir un campo y un valor.",
}

export default async function FilterToolbarPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams
  return (
    <ExampleFrame title="Barra de filtros" description="El botón crece hasta el menú. Quitar un chip pasa el foco al vecino.">
      <Demo locale={lang === "es" ? "es" : "en"} />
    </ExampleFrame>
  )
}
