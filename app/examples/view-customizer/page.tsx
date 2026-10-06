import type { Metadata } from "next"

import { ViewCustomizerDemo } from "./demo"

export const metadata: Metadata = {
  title: "Vistas de la colección",
  description: "Menú para encender vistas y una pastilla que aparece al haber dos.",
}

export default function Page() {
  return <ViewCustomizerDemo />
}
