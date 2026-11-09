"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */

import { useMemo } from "react"

import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { Input } from "@/components/ui/input"
import { PresenceProvider, useTypingPresence } from "@/registry/retana/lib/presence"
import { TypingIndicator } from "@/registry/ui/typing-indicator"

import { createStudio, type StudioPresence } from "../presence/studio"
import { empty, error, filled, loading, presence } from "./fixtures"

const frame: SceneFrame = { size: "sm", surface: "card", padding: "md" }
const packs = { filled, empty, loading, error, presence }
void packs

function Field() {
  const notify = useTypingPresence<StudioPresence>("isTyping")
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Input aria-label="Mensaje" placeholder="Escribe" onChange={() => notify()} />
      <TypingIndicator />
    </div>
  )
}

function Piece({ locale, id }: SceneRenderProps & { id: string }) {
  const t = (es: string, en: string) => sceneText(locale, es, en)
  const studio = useMemo(() => createStudio(), [])
  if (id === "loading") return <div role="status" aria-label={t("Cargando", "Loading")} className="h-11 w-40 animate-pulse rounded-full bg-muted" />
  if (id === "error") return <p role="alert" className="text-sm text-destructive">{t("No se pudo leer quién escribe.", "Could not read who is typing.")}</p>
  if (id === "empty") return <TypingIndicator names={[]} label={() => ""} />
  if (id === "presence") {
    return (
      <PresenceProvider adapter={studio.memory}>
        <Field />
      </PresenceProvider>
    )
  }
  return <TypingIndicator names={["Marina Soler"]} label={() => t("Marina escribe…", "Marina is typing…")} dots avatar={<span className="grid size-8 place-items-center rounded-full bg-foreground text-[10px] text-background">M</span>} />
}

function scene(id: string) {
  return function Render(props: SceneRenderProps) {
    return <Piece {...props} id={id} />
  }
}

export const scenes: Scene[] = [
  { id: filled.id, label: "Lleno", labelEn: "Filled", render: scene(filled.id), frame },
  { id: empty.id, label: "Vacío", labelEn: "Empty", render: scene(empty.id), frame },
  { id: loading.id, label: "Cargando", labelEn: "Loading", render: scene(loading.id), frame },
  { id: error.id, label: "Error", labelEn: "Error", render: scene(error.id), frame },
  { id: presence.id, label: "Presencia", labelEn: "Presence", render: scene(presence.id), frame },
]
