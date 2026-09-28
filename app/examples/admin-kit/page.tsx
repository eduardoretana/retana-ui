import type { Metadata } from "next"

import { AdminKitDemo } from "./demo"

export const metadata: Metadata = {
  title: "Admin kit",
  description: "Administración de demostración en memoria, con datos ficticios en español.",
}

export default function AdminKitPage() {
  return <AdminKitDemo />
}
