"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { SuggestedReplies } from "@/registry/ui/suggested-replies"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <SuggestedReplies status="loading" />
  if (id === "error") return <SuggestedReplies status="error" error={t("No se pudieron armar las sugerencias.", "Suggestions could not be built.")} />
  if (id === "empty") return <SuggestedReplies status="empty" emptyLabel={t("Sin sugerencias", "No suggestions")} />
  return (
    <SuggestedReplies
      label={t("Sugerencias", "Suggestions")}
      items={[
        { id: "crono", label: t("Compartir cronograma", "Share the schedule") },
        { id: "call", label: t("Agendar llamada", "Schedule a call") },
        { id: "reporte", label: t("Enviar reporte", "Send the report") },
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
