"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { ThreadComposer } from "@/registry/ui/thread-composer"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <ThreadComposer status="loading" />
  if (id === "error") return <ThreadComposer status="error" error={t("No se pudo abrir el compositor.", "The composer could not be opened.")} />
  if (id === "empty") return <ThreadComposer status="empty" emptyLabel={t("Sin compositor", "No composer")} />
  return (
    <ThreadComposer
      placeholder={t("Mensaje a Taller Ámbar…", "Message Taller Ámbar…")}
      sendLabel={t("Enviar", "Send")}
      askLabel={t("Preguntar a IA", "Ask AI")}
      attachLabel={t("Adjuntar", "Attach")}
      defaultValue={t("Va el jueves.", "Thursday works.")}
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
