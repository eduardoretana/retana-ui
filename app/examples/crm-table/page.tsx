import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla CRM",
  description: "Tabla de contactos con avatar, estado, etapa, dueño y actividad.",
}

export default function CrmTablePage() {
  return (
    <ExampleFrame
      wide
      title="Tabla CRM"
      description="Composición de columnas para un pipeline. Si instalas data-table, crmColumnDefs() encaja en AdminDataTable. Esta vista no depende de esa pieza."
    >
      <Demo />
    </ExampleFrame>
  )
}
