import type { Metadata } from "next"

import { ViewTableDemo } from "./demo"

export const metadata: Metadata = {
  title: "Table view",
  description: "Tabla con selección, columnas ordenables y celdas según el tipo de campo.",
}

export default function ViewTablePage() {
  return <ViewTableDemo />
}
