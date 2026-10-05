import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "CRM de ventas",
  description: "Cartera ficticia en español: tabla, filtros, ficha, paleta, alta y avisos.",
}

export default function CrmDashboardPage() {
  return <Demo />
}
