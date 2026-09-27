import type { Metadata } from "next"

import { AdminShellDemo } from "./demo"

export const metadata: Metadata = {
  title: "Admin shell",
  description: "Barra lateral, migas de pan y tema, con datos de demostración en español.",
}

export default function AdminShellPage() {
  return <AdminShellDemo />
}
