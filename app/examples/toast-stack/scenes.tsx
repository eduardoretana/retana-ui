"use client"

import { useEffect } from "react"
import { MotionConfig } from "motion/react"

import type { Scene } from "@/app/catalog/scene-types"
import { ToastStack, ToastStackProvider, useToastStack, type ToastType } from "@/registry/ui/toast-stack"

import { copy } from "./fixtures"

const card = { size: "md" as const, surface: "card" as const, padding: "md" as const }

function Seed({ title, description, type }: { title: string; description?: string; type: ToastType }) {
  const { toast } = useToastStack()
  useEffect(() => {
    toast({ id: "scene", title, description, type, duration: Infinity })
  }, [description, title, toast, type])
  return null
}

function Stack({
  seed,
  previewSwipe = 0,
  reduced = false,
  note,
}: {
  seed?: { title: string; description?: string; type: ToastType } | null
  previewSwipe?: number
  reduced?: boolean
  note?: string
}) {
  const body = (
    <ToastStackProvider>
      <div className="relative flex min-h-44 flex-col gap-3">
        {seed ? <Seed title={seed.title} description={seed.description} type={seed.type} /> : null}
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
        <ToastStack contained previewSwipe={previewSwipe} />
      </div>
    </ToastStackProvider>
  )
  if (!reduced) return body
  return <MotionConfig reducedMotion="always">{body}</MotionConfig>
}

export const scenes: Scene[] = [
  {
    id: "filled",
    label: "Lleno",
    labelEn: "Filled",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).filled} />,
  },
  {
    id: "empty",
    label: "Vacío",
    labelEn: "Empty",
    frame: card,
    render: (props) => <Stack {...props} seed={null} note={copy(props.locale).empty} />,
  },
  {
    id: "loading",
    label: "Cargando",
    labelEn: "Loading",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).loading} />,
  },
  {
    id: "error",
    label: "Error",
    labelEn: "Error",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).error} />,
  },
  {
    id: "dragging",
    label: "Arrastrando",
    labelEn: "Dragging",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).filled} previewSwipe={36} note={copy(props.locale).dragging} />,
  },
  {
    id: "dismissed",
    label: "Descartado",
    labelEn: "Dismissed",
    frame: card,
    render: (props) => <Stack {...props} seed={null} note={copy(props.locale).dismissed} />,
  },
  {
    id: "reduced",
    label: "Menos movimiento",
    labelEn: "Reduced motion",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).filled} reduced />,
  },
  {
    id: "keyboard",
    label: "Teclado",
    labelEn: "Keyboard",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).filled} note={copy(props.locale).keyboard} />,
  },
  {
    id: "390",
    label: "390 px",
    labelEn: "390 px",
    frame: card,
    render: (props) => (
      <div className="w-[390px] max-w-full">
        <Stack {...props} seed={copy(props.locale).filled} />
      </div>
    ),
  },
  {
    id: "extreme",
    label: "Datos extremos",
    labelEn: "Extreme data",
    frame: card,
    render: (props) => <Stack {...props} seed={copy(props.locale).extreme} />,
  },
]
