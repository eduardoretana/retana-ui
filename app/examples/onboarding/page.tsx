import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Puesta en marcha",
  description: "Cuatro pasos, herramientas para conectar y lista lateral.",
}

export default function ExamplePage() {
  return <Demo />
}
