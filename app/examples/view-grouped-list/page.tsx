import type { Metadata } from "next"

import { ViewGroupedListDemo } from "./demo"

export const metadata: Metadata = {
  title: "Grouped list",
  description: "Lista agrupada con encabezados plegables y campos compactos.",
}

export default function ViewGroupedListPage() {
  return <ViewGroupedListDemo />
}
