"use client"

import { MotionConfig } from "motion/react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/registry/ui/bottom-sheet"

import { copy } from "./fixtures"

const card = { size: "md" as const, surface: "card" as const, padding: "md" as const }

function Sheet({ locale, title, body, open = false, reduced = false, note }: SceneRenderProps & { title: string; body: string; open?: boolean; reduced?: boolean; note?: string }) {
  const sheet = (
    <div className="flex min-h-24 flex-col gap-2" data-locale={locale}>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      <BottomSheet title={title} defaultOpen={open} trigger={<Button variant="outline">Abrir</Button>}>
        <p className="text-sm">{body}</p>
      </BottomSheet>
    </div>
  )
  if (!reduced) return sheet
  return <MotionConfig reducedMotion="always">{sheet}</MotionConfig>
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame: card, render: (props) => <Sheet {...props} title={copy(props.locale).title} body={copy(props.locale).body} open /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame: card, render: (props) => <Sheet {...props} title={copy(props.locale).emptyTitle} body={copy(props.locale).emptyBody} open /> },
  {
    id: "loading",
    label: "Cargando",
    labelEn: "Loading",
    frame: card,
    render: ({ locale }) => <p className="text-sm text-muted-foreground" aria-busy="true">{copy(locale).loading}</p>,
  },
  {
    id: "error",
    label: "Error",
    labelEn: "Error",
    frame: card,
    render: ({ locale }) => <p role="alert" className="text-sm">{copy(locale).error}</p>,
  },
  { id: "dragging", label: "Arrastrando", labelEn: "Dragging", frame: card, render: (props) => <Sheet {...props} title={copy(props.locale).title} body={copy(props.locale).body} open note={copy(props.locale).dragging} /> },
  { id: "dismissed", label: "Cerrado", labelEn: "Closed", frame: card, render: (props) => <Sheet {...props} title={copy(props.locale).title} body={copy(props.locale).body} note={copy(props.locale).dismissed} /> },
  { id: "reduced", label: "Menos movimiento", labelEn: "Reduced motion", frame: card, render: (props) => <Sheet {...props} title={copy(props.locale).title} body={copy(props.locale).body} open reduced /> },
  { id: "keyboard", label: "Teclado", labelEn: "Keyboard", frame: card, render: (props) => <Sheet {...props} title={copy(props.locale).title} body={copy(props.locale).body} open note={copy(props.locale).keyboard} /> },
  {
    id: "390",
    label: "390 px",
    labelEn: "390 px",
    frame: card,
    render: (props) => (
      <div className="w-[390px] max-w-full">
        <Sheet {...props} title={copy(props.locale).title} body={copy(props.locale).extreme} open />
      </div>
    ),
  },
]
