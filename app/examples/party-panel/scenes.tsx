"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { PartyPanel } from "@/registry/ui/party-panel"

import { empty, error, filled, loading } from "./fixtures"

const packs = { filled, empty, loading, error }
void packs

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }


function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  if (id === "loading") return <PartyPanel state="loading" />
  if (id === "error") return <PartyPanel state="error" error={t("No se pudo leer la ficha.", "The profile could not be read.")} />
  if (id === "empty") return <PartyPanel state="empty" emptyLabel={t("Sin ficha", "No profile")} />
  return (
    <PartyPanel
      name="Taller Ámbar"
      meta={t("Cliente desde 2024 · León", "Client since 2024 · León")}
      deal={{ title: t("Marca", "Brand"), status: t("Abierto", "Open"), amount: "$34,600 de $48,000", value: 72, label: "72 %" }}
      facts={[{ id: "hito", label: t("Próximo hito", "Next milestone"), value: t("10 dic", "Dec 10") }]}
      members={[{ id: "m", name: "Marina Soler", role: t("Cliente · Finanzas", "Client · Finance") }]}
      files={[{ id: "f", name: "corte-marca.pdf", detail: t("248 KB · Hoy", "248 KB · Today") }]}
      secrets={[{ id: "curp", label: "CURP", masked: "••••••••••••••••••", revealed: "DEMO000000HDFXXX00" }]}
      revealLabel={t("Mostrar", "Show")}
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
