"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { SegmentedFilter } from "@/registry/ui/segmented-filter"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <SegmentedFilter label={t("Filtro", "Filter")} options={[]} status="loading" />
  if (id === "error") return <SegmentedFilter label={t("Filtro", "Filter")} options={[]} status="error" error={t("No se pudo leer el filtro.", "The filter could not be read.")} />
  if (id === "empty") return <SegmentedFilter label={t("Filtro", "Filter")} options={[]} status="empty" emptyLabel={t("Sin filtros", "No filters")} />
  return (
    <SegmentedFilter
      label={t("Filtro", "Filter")}
      value="all"
      options={[
        { value: "all", label: t("Todos", "All") },
        { value: "clients", label: t("Clientes", "Clients") },
        { value: "team", label: t("Equipo", "Team") },
        { value: "unread", label: t("Sin leer", "Unread") },
      ]}
    />
  )
}


function scene(id: "filled" | "empty" | "loading" | "error") {
  return function Render(props: SceneRenderProps) {
    return <Piece {...props} id={id} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene("filled"), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene("empty"), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene("loading"), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene("error"), frame },
]
