"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { AvatarGroup } from "@/registry/ui/avatar-group"

import { copy, empty, error, filled, type CirclePerson } from "./fixtures"

const frame: SceneFrame = { size: "sm", surface: "canvas", padding: "md" }

function Row({
  locale,
  members,
  namePlace = "below",
}: {
  locale: SceneRenderProps["locale"]
  members: CirclePerson[]
  namePlace?: "above" | "below"
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{sceneText(locale, copy.title.es, copy.title.en)}</p>
      <AvatarGroup
        layout="circle"
        namePlace={namePlace}
        members={members}
        size="lg"
        label={sceneText(locale, copy.label.es, copy.label.en)}
      />
    </div>
  )
}

function FilledScene({ locale }: SceneRenderProps) {
  return <Row locale={locale} members={filled} />
}

function EmptyScene({ locale }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{sceneText(locale, copy.empty.es, copy.empty.en)}</p>
      <Row locale={locale} members={empty} />
    </div>
  )
}

function LoadingScene({ locale }: SceneRenderProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3" aria-busy="true">
      <p className="text-sm font-medium text-foreground">{sceneText(locale, copy.title.es, copy.title.en)}</p>
      <SceneStatus tone="loading">{sceneText(locale, copy.loading.es, copy.loading.en)}</SceneStatus>
      <div className="flex w-full min-w-0 flex-wrap justify-center gap-3">
        {loadingPlaceholders().map((name) => (
          <div key={name} className="flex w-16 flex-col items-center gap-1">
            <div className="size-12 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-12 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  )
}

function loadingPlaceholders() {
  return filled.map((person) => person.name)
}

function ErrorScene({ locale }: SceneRenderProps) {
  return (
    <div className="flex flex-col gap-3">
      <SceneStatus tone="error">{sceneText(locale, copy.error.es, copy.error.en)}</SceneStatus>
      <Row locale={locale} members={error} />
    </div>
  )
}

function AboveScene({ locale }: SceneRenderProps) {
  return <Row locale={locale} members={filled} namePlace="above" />
}

function StackScene() {
  const crew = filled.map((person, index) => ({
    name: person.name,
    status: index === 0 ? ("online" as const) : undefined,
  }))
  return <AvatarGroup members={crew} max={3} label="Equipo del horno" />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "circle", label: "Círculo", labelEn: "Circle", render: FilledScene, frame },
  { id: "circle-above", label: "Nombres arriba", labelEn: "Names above", render: AboveScene, frame },
  { id: "stack", label: "Pila", labelEn: "Stack", render: StackScene, frame },
]
