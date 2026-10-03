import type { Metadata } from "next"

import { RecordPropertiesDemo } from "./demo"

export const metadata: Metadata = {
  title: "Record properties",
  description: "Lista de propiedades editables según el esquema del registro.",
}

export default function RecordPropertiesPage() {
  return <RecordPropertiesDemo />
}
