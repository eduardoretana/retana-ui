import type { Metadata } from "next"

import { UseMultiViewDemo } from "./demo"

export const metadata: Metadata = {
  title: "useMultiView",
  description: "Estado de vista, búsqueda, filtros y selección, con adaptador de URL.",
}

export default function UseMultiViewPage() {
  return <UseMultiViewDemo />
}
