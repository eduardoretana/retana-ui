import type { Metadata } from "next"

import { OverviewDashboardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Overview dashboard",
  description: "Panel de resumen que compone las tarjetas y la tendencia.",
}

export default function OverviewDashboardPage() {
  return <OverviewDashboardDemo />
}
