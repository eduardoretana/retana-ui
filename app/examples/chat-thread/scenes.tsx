"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { ChatThread } from "@/registry/ui/chat-thread"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <ChatThread label={t("Hilo", "Thread")} state="loading" />
  if (id === "error") return <ChatThread label={t("Hilo", "Thread")} state="error" error={t("No se pudo leer el hilo.", "The thread could not be read.")} onRetry={() => {}} />
  if (id === "empty") return <ChatThread label={t("Hilo", "Thread")} state="empty" emptyLabel={t("Aún no hay mensajes", "No messages yet")} title="Taller Ámbar" />
  return (
    <ChatThread
      label={t("Hilo", "Thread")}
      title="Taller Ámbar"
      status={t("En línea · Marca", "Online · Brand")}
      presence="online"
      messages={[
        { id: "a", side: "incoming", author: "Marina Soler", time: "10:46", body: t("¿Hablamos el jueves?", "Can we talk on Thursday?"), enter: true },
        { id: "b", side: "outgoing", author: t("Tú", "You"), time: "10:47", body: t("Sí.", "Yes."), delivery: "read", deliveryLabel: t("Leído", "Read") },
      ]}
      typing={{ names: ["Marina Soler"], label: t("Marina escribe…", "Marina is typing…") }}
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
