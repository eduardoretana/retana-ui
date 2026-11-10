"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { MessageCardMetric } from "@/registry/ui/message-card-metric"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <MessageCardMetric state="loading" />
  if (id === "error") return <MessageCardMetric state="error" error={t("No se pudo leer la métrica.", "The metric could not be read.")} />
  if (id === "empty") return <MessageCardMetric state="empty" emptyLabel={t("Sin métrica", "No metric")} />
  return <MessageCardMetric title={t("Salud de entrega", "Delivery health")} chip={t("Analítica", "Analytics")} value="92 %" caption={t("a tiempo", "on time")} filled={11} total={12} start={t("11 de 12 hitos", "11 of 12 milestones")} end={t("Lanzamiento 10 dic", "Launch Dec 10")} />
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
