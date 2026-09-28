import type { Metadata } from "next"

import { AdminChartsDemo } from "./demo"

export const metadata: Metadata = {
  title: "Admin charts",
  description: "Tarjetas, tendencia, embudo, fuentes, mapa de calor y scroll.",
}

export default function AdminChartsPage() {
  return <AdminChartsDemo />
}
