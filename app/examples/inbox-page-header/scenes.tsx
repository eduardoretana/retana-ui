"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { InboxPageHeader } from "@/registry/ui/inbox-page-header"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <InboxPageHeader title={t("Mensajes", "Messages")} status="loading" />
  if (id === "error") return <InboxPageHeader title={t("Mensajes", "Messages")} status="error" error={t("No se pudo armar el encabezado.", "The header could not be built.")} />
  if (id === "empty") return <InboxPageHeader title={t("Mensajes", "Messages")} status="empty" emptyLabel={t("Sin encabezado", "No header")} />
  return (
    <InboxPageHeader
      crumbs={[{ label: t("Espacio", "Workspace"), href: "#espacio" }, { label: t("Mensajes", "Messages") }]}
      title={t("Mensajes", "Messages")}
      subtitle={t("Conversaciones con clientes y el equipo · 2 sin leer", "Conversations with clients and the team · 2 unread")}
      actions={[{ id: "group", label: t("Nuevo grupo", "New group") }, { id: "chat", label: t("Nuevo chat", "New chat") }]}
      bellLabel={t("Avisos", "Notices")}
      bellCount={3}
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
