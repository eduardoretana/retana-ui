"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { ConversationItem } from "@/registry/ui/conversation-item"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <ConversationItem item={{ id: "x", title: "" }} status="loading" />
  if (id === "error") return <ConversationItem item={{ id: "x", title: "" }} status="error" error={t("No se pudo leer la fila.", "The row could not be read.")} />
  if (id === "empty") return <ConversationItem item={{ id: "x", title: "" }} status="empty" emptyLabel={t("Sin conversación", "No conversation")} />
  return (
    <div role="listbox" aria-label={t("Conversaciones", "Conversations")}>
      <ConversationItem
        selected
        item={{
          id: "ambar",
          title: "Taller Ámbar",
          preview: t("Tú: Va el corte revisado.", "You: The revised cut is on its way."),
          time: "10:44",
          unread: 2,
          stage: t("Propuesta", "Proposal"),
          windowLabel: "6 h",
          channel: <span>WA</span>,
          presence: "online",
        }}
      />
    </div>
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
