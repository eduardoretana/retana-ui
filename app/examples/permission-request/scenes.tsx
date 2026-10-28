"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { PermissionRequest, type PermissionDecision } from "@/registry/ui/permission-request"

import {
  allowed,
  denied,
  destructive,
  durationLabel,
  empty,
  error as broken,
  filled,
  loading,
  permissionLabels,
  previewFrom,
  timed,
  type PermissionFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function PermissionScene({ locale, log, fixture, failAllow = false }: SceneRenderProps & { fixture: PermissionFixture; failAllow?: boolean }) {
  const sim = useSceneSim(
    {
      scope: fixture.scope ?? ("once" as const),
      decision: (fixture.decision ?? null) as PermissionDecision | null,
      touched: fixture.decision != null,
    },
    log,
  )
  const attempt = useRef(0)
  const decision = sim.state.touched || sim.state.decision ? sim.state.decision : (fixture.decision ?? null)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.allowError ? <SceneStatus tone="error">{fixture.allowError[locale]}</SceneStatus> : null}
      <PermissionRequest
        agent={fixture.agent ? { name: fixture.agent } : undefined}
        action={fixture.action?.[locale]}
        target={fixture.target}
        risk={fixture.risk}
        reason={fixture.reason?.[locale]}
        preview={previewFrom(fixture.preview, locale)}
        scope={sim.state.scope}
        duration={durationLabel(locale)}
        decision={decision}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={permissionLabels(locale)}
        onScopeChange={(scope) => sim.patch(formatSceneCall("onScopeChange", [scope]), (current) => ({ ...current, scope }))}
        onDecisionChange={(next) => {
          if (next == null || !next.allow) {
            sim.patch(formatSceneCall("onDecisionChange", [next?.allow ?? null]), (current) => ({ ...current, decision: next, touched: true }))
            return
          }
          attempt.current += 1
          const fail = failAllow && attempt.current === 1
          void sim.call(formatSceneCall("onDecisionChange", [true, next.scope]), (current) => ({ ...current, decision: next, touched: true }), undefined, { fail })
        }}
      />
    </div>
  )
}

function scene(fixture: PermissionFixture, failAllow = false) {
  return function Render(props: SceneRenderProps) {
    return <PermissionScene {...props} fixture={fixture} failAllow={failAllow} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken, true), frame },
  { id: "allowed", label: "Permitido", labelEn: "Allowed", render: scene(allowed), frame },
  { id: "denied", label: "Negado", labelEn: "Denied", render: scene(denied), frame },
  { id: "destructive", label: "Destructivo", labelEn: "Destructive", render: scene(destructive), frame },
  { id: "timed", label: "Un rato", labelEn: "Timed", render: scene(timed), frame },
]
