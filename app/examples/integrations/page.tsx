import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Integraciones",
  description: "Directorio por categorías, búsqueda, conectar y pedido.",
}

export default function ExamplePage() {
  return <Demo />
}
