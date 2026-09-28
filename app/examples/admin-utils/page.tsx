import type { Metadata } from "next"

import { AdminUtilsDemo } from "./demo"

export const metadata: Metadata = {
  title: "Admin utils",
  description: "Slug, orden y helpers de datos para el admin.",
}

export default function AdminUtilsPage() {
  return <AdminUtilsDemo />
}
