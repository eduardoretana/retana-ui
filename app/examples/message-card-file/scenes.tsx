"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { MessageCardFile } from "@/registry/ui/message-card-file"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <MessageCardFile state="loading" />
  if (id === "error") return <MessageCardFile state="error" error={t("No se pudo leer el archivo.", "The file could not be read.")} onRetry={() => {}} />
  if (id === "empty") return <MessageCardFile state="empty" emptyLabel={t("Sin archivo", "No file")} />
  return <MessageCardFile name="corte-marca.pdf" detail={t("248 KB · PDF", "248 KB · PDF")} status={t("En revisión", "In review")} downloadLabel={t("Descargar", "Download")} onDownload={() => {}} />
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
