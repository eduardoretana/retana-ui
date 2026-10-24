import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Shell de la aplicación",
  description: "Barra de espacio de trabajo, proyectos, primeros pasos y la tarjeta de contenido.",
}

export default function ExamplePage() {
  return <Demo />
}
