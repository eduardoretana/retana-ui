import type { Metadata } from "next"

import { SettingsFormDemo } from "./demo"

export const metadata: Metadata = {
  title: "Settings form",
  description: "Formulario de textos con barra fija, descarte y aviso al salir.",
}

export default function SettingsFormPage() {
  return <SettingsFormDemo />
}
