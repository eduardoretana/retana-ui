import type { Metadata } from "next"

import { EntityFormDemo } from "./demo"

export const metadata: Metadata = {
  title: "Entity form",
  description: "Diálogo de alta y edición que conserva la posición al guardar.",
}

export default function EntityFormPage() {
  return <EntityFormDemo />
}
