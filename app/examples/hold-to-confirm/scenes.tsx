"use client"

import { MotionConfig } from "motion/react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { HoldToConfirm } from "@/registry/ui/hold-to-confirm"

import { copy } from "./fixtures"

const card = { size: "sm" as const, surface: "card" as const, padding: "md" as const }

function Hold({ locale, label, confirmed = false, disabled = false, reduced = false, note }: SceneRenderProps & { label: string; confirmed?: boolean; disabled?: boolean; reduced?: boolean; note?: string }) {
  const button = (
    <div className="flex flex-col items-start gap-2" data-locale={locale}>
      <HoldToConfirm label={label} confirmedLabel={copy(locale).confirmed} confirmed={confirmed} disabled={disabled} onConfirm={() => {}} />
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
  if (!reduced) return button
  return <MotionConfig reducedMotion="always">{button}</MotionConfig>
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame: card, render: (props) => <Hold {...props} label={copy(props.locale).label} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame: card, render: (props) => <Hold {...props} label={copy(props.locale).empty} disabled /> },
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
  { id: "dragging", label: "Manteniendo", labelEn: "Holding", frame: card, render: (props) => <Hold {...props} label={copy(props.locale).label} note={copy(props.locale).dragging} /> },
  { id: "dismissed", label: "Soltado", labelEn: "Released", frame: card, render: (props) => <Hold {...props} label={copy(props.locale).label} note={copy(props.locale).dismissed} /> },
  { id: "reduced", label: "Menos movimiento", labelEn: "Reduced motion", frame: card, render: (props) => <Hold {...props} label={copy(props.locale).label} reduced /> },
  { id: "keyboard", label: "Teclado", labelEn: "Keyboard", frame: card, render: (props) => <Hold {...props} label={copy(props.locale).label} note={copy(props.locale).keyboard} /> },
  {
    id: "390",
    label: "390 px",
    labelEn: "390 px",
    frame: card,
    render: (props) => (
      <div className="w-[390px] max-w-full">
        <Hold {...props} label={copy(props.locale).extreme} />
      </div>
    ),
  },
]
