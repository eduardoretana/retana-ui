import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra lateral de dos capas",
  description: "Riel de iconos y panel de navegación sobre el sidebar de shadcn.",
}

export default function RailSidebarPage() {
  return <Demo />
}
