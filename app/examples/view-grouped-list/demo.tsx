"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { projectFields, projectViews, projects } from "@/app/examples/multi-view/data"
import { ViewGroupedList } from "@/registry/ui/view-grouped-list"

export function ViewGroupedListDemo() {
  return (
    <ExampleFrame wide title="Grouped list" description="Filas agrupadas por equipo, con campos compactos a la derecha.">
      <ViewGroupedList records={projects} fields={projectFields} config={projectViews[0]!} locale="es-MX" />
    </ExampleFrame>
  )
}
