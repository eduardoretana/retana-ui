import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ajustes y facturación",
  description: "Pestañas, créditos, plan, pago, precios y facturas.",
}

export default function ExamplePage() {
  return <Demo />
}
