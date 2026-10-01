import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra de anuncios",
  description: "Mensajes que rotan y una barra que se puede cerrar.",
}

export default function AnnouncementBarPage() {
  return (
    <ExampleFrame title="Barra de anuncios" description="Los mensajes suben uno tras otro. Cerrar recuerda el aviso.">
      <Demo />
    </ExampleFrame>
  )
}
