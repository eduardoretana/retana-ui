import type { Metadata } from "next"

import { DataTableDemo } from "./demo"

export const metadata: Metadata = {
  title: "Data table",
  description: "Tabla de reservas con filtros, selección, CSV y panel de detalle.",
}

export default function DataTablePage() {
  return <DataTableDemo />
}
