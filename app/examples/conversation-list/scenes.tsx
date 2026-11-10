"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { ConversationList } from "@/registry/ui/conversation-list"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "sm", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <ConversationList label={t("Conversaciones", "Conversations")} status="loading" />
  if (id === "error") return <ConversationList label={t("Conversaciones", "Conversations")} status="error" error={t("No se pudo leer la lista.", "The list could not be read.")} onRetry={() => {}} />
  if (id === "empty") return <ConversationList label={t("Conversaciones", "Conversations")} status="empty" emptyTitle={t("Sin conversaciones", "No conversations")} />
  return (
    <ConversationList
      label={t("Conversaciones", "Conversations")}
      title={t("Mensajes", "Messages")}
      countLabel="2"
      searchLabel={t("Buscar mensajes", "Search messages")}
      shortcut="⌘K"
      filter="all"
      filters={[{ value: "all", label: t("Todos", "All") }, { value: "unread", label: t("Sin leer", "Unread") }]}
      sections={[{ id: "pinned", label: t("Fijados", "Pinned") }, { id: "all", label: t("Todos los mensajes", "All messages") }]}
      selectedId="ambar"
      items={[
        { id: "ambar", title: "Taller Ámbar", preview: t("Tú: Va el corte.", "You: The cut is coming."), time: "10:44", unread: 2, section: "pinned", tags: ["unread"] },
        { id: "arcilla", title: "Arcilla Viva", preview: t("¿Seguimos en diciembre?", "Still on for December?"), time: "09:12", section: "all" },
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
