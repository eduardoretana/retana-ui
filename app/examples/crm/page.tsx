import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Hoja de ventas",
  description: "Cartera editable: empresa, etapa, responsable y valor.",
}

export default function ExamplePage() {
  return <Demo />
}
