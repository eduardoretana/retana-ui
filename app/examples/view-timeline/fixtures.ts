import type { MultiRecord } from "@/registry/lib/multi-view"

import { projectFields, projects, projectViews } from "../multi-view/data"

export { projectFields, projectViews }

export const filled = projects

export const empty: MultiRecord[] = []

export const loading = { label: "Cargando el cronograma" }

export const error = { label: "No se pudo cargar el cronograma." }

export const dismissed: MultiRecord[] = projects.map((record, index) =>
  index === 0 ? { ...record, start: "2026-04-08", end: "2026-04-17" } : record,
)

export function extreme(): MultiRecord[] {
  return [
    {
      ...projects[0]!,
      id: "largo",
      name: "NorthPacificClayBodySpecificationWithoutSpacesOrBreaksForStressLayout",
    },
  ]
}
