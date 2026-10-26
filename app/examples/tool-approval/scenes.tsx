"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { ToolApproval, type ApprovalDecision } from "@/registry/ui/tool-approval"

import { approved, denied, empty, error, filled, loading, toolLabels, type ToolFixture } from "./fixtures"

type Gate = {
  decision: ApprovalDecision | null
  busy: boolean
  alwaysAllow: boolean
  invoiceChecked: boolean
}

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

function gateFrom(fixture: ToolFixture, extra?: Partial<Gate>): Gate {
  return {
    decision: fixture.decision ?? null,
    busy: fixture.busy ?? false,
    alwaysAllow: false,
    invoiceChecked: false,
    ...extra,
  }
}

function GateScene({
  locale,
  log,
  fixture,
  initial,
  failFirst = false,
  allowAlways = true,
}: SceneRenderProps & { fixture: ToolFixture; initial: Gate; failFirst?: boolean; allowAlways?: boolean }) {
  const copy = fixture[locale]
  const sim = useSceneSim(initial, log)
  const attempt = useRef(0)

  function approve() {
    attempt.current += 1
    const fail = failFirst && attempt.current === 1
    void sim.call(
      formatSceneCall("onApprove"),
      (current) => ({ ...current, busy: true }),
      (current) => ({ ...current, busy: false, decision: "approved" }),
      { fail, delay: 700 },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sim.failed ? <SceneStatus tone="error">{copy.error}</SceneStatus> : null}
      <ToolApproval
        toolName={fixture.toolName}
        reason={copy.reason}
        risk={fixture.risk}
        args={copy.args}
        changes={copy.changes}
        versionLabel={fixture.versionLabel}
        title={copy.title}
        approveLabel={copy.approve}
        denyLabel={copy.deny}
        hint={copy.hint}
        labels={toolLabels(locale)}
        decision={sim.state.decision}
        busy={sim.state.busy || sim.pending != null}
        alwaysAllow={sim.state.alwaysAllow}
        choices={
          copy.choice
            ? [
                {
                  id: "factura",
                  label: copy.choice,
                  required: true,
                  checked: sim.state.invoiceChecked,
                  onCheckedChange: (checked) => {
                    sim.patch(formatSceneCall("onCheckedChange", ["factura", checked]), (current) => ({
                      ...current,
                      invoiceChecked: checked,
                    }))
                  },
                },
              ]
            : undefined
        }
        onAlwaysAllowChange={
          allowAlways
            ? (value) => {
                sim.patch(formatSceneCall("onAlwaysAllowChange", [value]), (current) => ({ ...current, alwaysAllow: value }))
              }
            : undefined
        }
        onDecision={(decision) => log(formatSceneCall("onDecision", [decision]))}
        onApprove={approve}
        onDeny={() => {
          void sim.call(
            formatSceneCall("onDeny"),
            (current) => ({ ...current, busy: true }),
            (current) => ({ ...current, busy: false, decision: "rejected" }),
          )
        }}
      />
    </div>
  )
}

function FilledScene(props: SceneRenderProps) {
  return <GateScene {...props} fixture={filled} initial={gateFrom(filled)} />
}

function EmptyScene(props: SceneRenderProps) {
  return <GateScene {...props} fixture={empty} initial={gateFrom(empty)} allowAlways={false} />
}

function LoadingScene(props: SceneRenderProps) {
  return <GateScene {...props} fixture={loading} initial={gateFrom(loading, { invoiceChecked: true })} />
}

function ErrorScene(props: SceneRenderProps) {
  return <GateScene {...props} fixture={error} initial={gateFrom(error, { invoiceChecked: true })} failFirst />
}

function ApprovedScene(props: SceneRenderProps) {
  return <GateScene {...props} fixture={approved} initial={gateFrom(approved)} />
}

function DeniedScene(props: SceneRenderProps) {
  return <GateScene {...props} fixture={denied} initial={gateFrom(denied)} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "approved", label: "Aprobado", labelEn: "Approved", render: ApprovedScene, frame },
  { id: "denied", label: "Rechazado", labelEn: "Denied", render: DeniedScene, frame },
]