"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { AgentLedger } from "@/registry/ui/agent-ledger"

import {
  LEDGER_NOW,
  chain,
  changesFrom,
  empty,
  error as broken,
  filled,
  ledgerLabels,
  loading,
  undone,
  type LedgerFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }

type LedgerState = { undone: string[] }

function LedgerScene({
  locale,
  log,
  fixture,
  failUndo = false,
}: SceneRenderProps & { fixture: LedgerFixture; failUndo?: boolean }) {
  const sim = useSceneSim<LedgerState>({ undone: [...fixture.undone] }, log)
  const attempt = useRef(0)

  return (
    <div className="flex flex-col gap-3">
      {sim.failed && fixture.undoError ? <SceneStatus tone="error">{fixture.undoError[locale]}</SceneStatus> : null}
      <AgentLedger
        changes={changesFrom(fixture.changes, locale)}
        agent={fixture.agent[locale]}
        now={LEDGER_NOW}
        undone={sim.state.undone}
        pointedId={fixture.pointedId}
        loading={fixture.loading}
        error={fixture.banner?.[locale]}
        labels={ledgerLabels(locale)}
        onUndo={(ids) => {
          attempt.current += 1
          const fail = failUndo && attempt.current === 1
          void sim.call(
            formatSceneCall("onUndo", [ids]),
            (current) => ({ undone: [...new Set([...current.undone, ...ids])] }),
            undefined,
            { fail },
          )
        }}
        onRedo={(ids) => {
          const drop = new Set(ids)
          sim.patch(formatSceneCall("onRedo", [ids]), (current) => ({
            undone: current.undone.filter((id) => !drop.has(id)),
          }))
        }}
      />
    </div>
  )
}

function scene(fixture: LedgerFixture, failUndo = false) {
  return function Render(props: SceneRenderProps) {
    return <LedgerScene {...props} fixture={fixture} failUndo={failUndo} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "undone", label: "Deshecho", labelEn: "Undone", render: scene(undone), frame },
  { id: "chain", label: "Cadena", labelEn: "Chain", render: scene(chain, true), frame },
]
