"use client"

import { MotionConfig } from "motion/react"

import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { NotificationStack } from "@/registry/ui/notification-stack"

import { copy, dismissed, empty, extreme, filled } from "./fixtures"

const card = { size: "md" as const, surface: "card" as const, padding: "md" as const }
const narrow = { size: "md" as const, surface: "card" as const, padding: "sm" as const }

function Stack({ locale, items, previewOffset = 0, reduced = false }: SceneRenderProps & { items: typeof filled; previewOffset?: number; reduced?: boolean }) {
  const text = copy(locale)
  const stack = (
    <NotificationStack
      items={items}
      expandable={false}
      label={text.label}
      emptyLabel={text.empty}
      previewOffset={previewOffset}
      className="w-full"
    />
  )
  if (!reduced) return stack
  return <MotionConfig reducedMotion="always">{stack}</MotionConfig>
}

export const scenes: Scene[] = [
  {
    id: "filled",
    label: "Lleno",
    labelEn: "Filled",
    frame: card,
    render: (props) => <Stack {...props} items={filled} />,
  },
  {
    id: "empty",
    label: "Vacío",
    labelEn: "Empty",
    frame: card,
    render: (props) => <Stack {...props} items={empty} />,
  },
  {
    id: "loading",
    label: "Cargando",
    labelEn: "Loading",
    frame: card,
    render: ({ locale }) => (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground" aria-busy="true">
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
      <p role="alert" className="rounded-2xl border border-border bg-card px-4 py-6 text-sm text-foreground">
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
        <Stack {...props} items={filled} previewOffset={56} />
        <p className="text-xs text-muted-foreground">{copy(props.locale).dragging}</p>
      </div>
    ),
  },
  {
    id: "dismissed",
    label: "Descartado",
    labelEn: "Dismissed",
    frame: card,
    render: (props) => (
      <div className="flex flex-col gap-2">
        <Stack {...props} items={dismissed} />
        <p className="text-xs text-muted-foreground">{copy(props.locale).dismissed}</p>
      </div>
    ),
  },
  {
    id: "reduced",
    label: "Menos movimiento",
    labelEn: "Reduced motion",
    frame: card,
    render: (props) => <Stack {...props} items={filled} reduced />,
  },
  {
    id: "keyboard",
    label: "Teclado",
    labelEn: "Keyboard",
    frame: card,
    render: (props) => (
      <div className="flex flex-col gap-2">
        <Stack {...props} items={filled} />
        <p className="text-xs text-muted-foreground">{copy(props.locale).keyboard}</p>
      </div>
    ),
  },
  {
    id: "390",
    label: "390 px",
    labelEn: "390 px",
    frame: narrow,
    render: (props) => (
      <div className="w-[390px] max-w-full">
        <Stack {...props} items={filled} />
      </div>
    ),
  },
  {
    id: "extreme",
    label: "Datos extremos",
    labelEn: "Extreme data",
    frame: narrow,
    render: (props) => <Stack {...props} items={extreme()} />,
  },
]
