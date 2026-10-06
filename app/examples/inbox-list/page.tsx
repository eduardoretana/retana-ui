import type { Metadata } from "next"

import { InboxListDemo } from "./demo"

export const metadata: Metadata = {
  title: "Lista de bandeja",
  description: "Lista genérica con presencia, vista previa y no leídos.",
}

export default function Page() {
  return <InboxListDemo />
}
