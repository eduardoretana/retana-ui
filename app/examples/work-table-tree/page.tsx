import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WorkTableTree } from "@/registry/blocks/work-table-tree"

export const metadata: Metadata = {
  title: "Árbol de secciones",
  description: "Secciones y artículos con niveles de anidación al soltar.",
}

export default function WorkTableTreePage() {
  return (
    <ExampleFrame
      wide
      title="Árbol de secciones"
      description="Secciones y artículos. El indicador de soltar muestra el nivel. El pie resume secciones, artículos y puntos."
    >
      <WorkTableTree />
    </ExampleFrame>
  )
}
