"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { AppRail } from "@/registry/ui/app-rail"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "sm", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <AppRail label={t("Espacios", "Spaces")} status="loading" loadingLabel={t("Cargando el riel", "Loading the rail")} />
  if (id === "error") return <AppRail label={t("Espacios", "Spaces")} status="error" error={t("No se pudo leer el riel.", "The rail could not be read.")} />
  if (id === "empty") return <AppRail label={t("Espacios", "Spaces")} status="empty" emptyLabel={t("Sin destinos", "No destinations")} />
  return (
    <AppRail
      label={t("Espacios", "Spaces")}
      mark="Á"
      user={{ name: "Diego Rueda" }}
      items={[
        { id: "home", label: t("Inicio", "Home") },
        { id: "chat", label: t("Mensajes", "Messages"), active: true },
        { id: "pay", label: t("Pagos", "Payments") },
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
