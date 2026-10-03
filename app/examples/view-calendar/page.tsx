import type { Metadata } from "next"

import { ViewCalendarDemo } from "./demo"

export const metadata: Metadata = {
  title: "Calendar view",
  description: "Cuadrícula mensual con fichas en su fecha, desborde y agenda estrecha.",
}

export default function ViewCalendarPage() {
  return <ViewCalendarDemo />
}
