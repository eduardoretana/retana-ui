"use client"

import { useState } from "react"
import { MotionConfig } from "motion/react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { SlideToConfirm } from "@/registry/ui/slide-to-confirm"

import { copy } from "./fixtures"

const card = { size: "sm" as const, surface: "card" as const, padding: "md" as const }

function Control({ locale, log, label, disabled = false, reduced = false }: SceneRenderProps & { label: string; disabled?: boolean; reduced?: boolean }) {
  const [done, setDone] = useState(0)
  const control = (
    <div className="flex w-full max-w-sm flex-col gap-2" data-locale={locale}>
      <SlideToConfirm
        disabled={disabled}
        label={label}
        onConfirm={() => {
          setDone((value) => value + 1)
          log(formatSceneCall("onConfirm", []))
        }}
      />
      <p className="text-xs text-muted-foreground">{done}</p>
    </div>
  )
  if (!reduced) return control
  return <MotionConfig reducedMotion="always">{control}</MotionConfig>
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", frame: card, render: (props) => <Control {...props} label={copy(props.locale).label} /> },
  { id: "empty", label: "Vacío", labelEn: "Empty", frame: card, render: (props) => <Control {...props} label={copy(props.locale).empty} disabled /> },
  {
    id: "loading",
    label: "Cargando",
    labelEn: "Loading",
    frame: card,
    render: ({ locale }) => (
      <p className="text-sm text-muted-foreground" aria-busy="true">
        {copy(locale).loading}
      </p>
    ),
  },
  {
    id: "error",
    label: "Error",
    labelEn: "Error",
    frame: card,
    render: ({ locale }) => (
      <p role="alert" className="text-sm text-foreground">
        {copy(locale).error}
      </p>
    ),
  },
  {
    id: "dragging",
    label: "Arrastrando",
    labelEn: "Dragging",
    frame: card,
    render: (props) => (
      <div className="flex flex-col gap-2">
        <Control {...props} label={copy(props.locale).label} />
        <p className="text-xs text-muted-foreground">{copy(props.locale).dragging}</p>
      </div>
    ),
  },
  {
    id: "dismissed",
    label: "Confirmado",
    labelEn: "Confirmed",
    frame: card,
    render: (props) => (
      <div className="flex flex-col gap-2">
        <Control {...props} label={copy(props.locale).label} />
        <p className="text-xs text-muted-foreground">{copy(props.locale).dismissed}</p>
      </div>
    ),
  },
  { id: "reduced", label: "Menos movimiento", labelEn: "Reduced motion", frame: card, render: (props) => <Control {...props} label={copy(props.locale).label} reduced /> },
  {
    id: "keyboard",
    label: "Teclado",
    labelEn: "Keyboard",
    frame: card,
    render: (props) => (
      <div className="flex flex-col gap-2">
        <Control {...props} label={copy(props.locale).label} />
        <p className="text-xs text-muted-foreground">{copy(props.locale).keyboard}</p>
      </div>
    ),
  },
  {
    id: "390",
    label: "390 px",
    labelEn: "390 px",
    frame: card,
    render: (props) => (
      <div className="w-[390px] max-w-full">
        <Control {...props} label={copy(props.locale).extreme} />
      </div>
    ),
  },
]
