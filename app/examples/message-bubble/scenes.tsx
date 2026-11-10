"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { MessageBubble } from "@/registry/ui/message-bubble"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <p role="status">{t("Cargando el mensaje", "Loading the message")}</p>
  if (id === "error") return <MessageBubble side="outgoing" author={t("Tú", "You")} delivery="failed" onRetry={() => {}} retryLabel={t("Reintentar", "Try again")}>{t("No se envió.", "Not sent.")}</MessageBubble>
  if (id === "empty") return <MessageBubble side="incoming" author="Marina" />
  return (
    <div className="grid gap-3">
      <MessageBubble side="incoming" author="Marina Soler" time="10:46" enter>{t("¿Hablamos el jueves?", "Can we talk on Thursday?")}</MessageBubble>
      <MessageBubble side="outgoing" author={t("Tú", "You")} time="10:47" delivery="read" deliveryLabel={t("Leído", "Read")}>{t("Sí. Solo falta el visto.", "Yes. Only the sign-off is left.")}</MessageBubble>
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
