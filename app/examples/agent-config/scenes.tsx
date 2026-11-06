"use client"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { AgentConfig } from "@/registry/ui/agent-config"

import { NimboNav } from "./nav"
import {
  draftDirty,
  empty,
  error as broken,
  filled,
  guardrailTypes,
  invalidBands,
  loading,
  models,
  narrow390,
  publishError,
  publishing,
  readonlyRole,
  testCasesFor,
  type AgentFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "desk", surface: "app", padding: "none" }
const narrowFrame: SceneFrame = { size: "sm", surface: "app", padding: "none" }

function SceneBody({
  locale,
  log,
  pack,
  failPublish = false,
}: SceneRenderProps & { pack: Record<"es" | "en", AgentFixture>; failPublish?: boolean }) {
  const fixture = pack[locale]
  return (
    <div className={pack === narrow390 ? "w-[390px] max-w-full" : undefined}>
      {fixture.error ? <SceneStatus tone="error">{fixture.error[locale]}</SceneStatus> : null}
      <AgentConfig
        locale={locale}
        workspace={fixture.workspace}
        agents={fixture.agents}
        versions={fixture.versions}
        models={models}
        guardrailTypes={guardrailTypes}
        testCases={testCasesFor(locale)}
        draft={fixture.draft}
        loading={fixture.loading}
        error={fixture.error?.[locale]}
        readOnly={fixture.readOnly}
        busy={fixture.busy}
        slots={{ navigation: <NimboNav locale={locale} /> }}
        onDraftChange={(draft) => log(formatSceneCall("onDraftChange", [draft.id]))}
        onSaveDraft={async (draft) => {
          log(formatSceneCall("onSaveDraft", [draft.id]))
        }}
        onPublishRequest={async (draft) => {
          log(formatSceneCall("onPublishRequest", [draft.number]))
          if (failPublish) throw new Error("publish failed")
        }}
        onRollbackRequest={async (version) => {
          log(formatSceneCall("onRollbackRequest", [version.number]))
        }}
        onCreateRequest={() => log(formatSceneCall("onCreateRequest"))}
        onUsageCost={(slot) => log(formatSceneCall("onUsageCost", [slot.exampleSpend]))}
      />
    </div>
  )
}

function scene(pack: Record<"es" | "en", AgentFixture>, failPublish = false) {
  return function Render(props: SceneRenderProps) {
    return <SceneBody {...props} pack={pack} failPublish={failPublish} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "draft-dirty", label: "Borrador", labelEn: "Draft", render: scene(draftDirty), frame },
  { id: "invalid-bands", label: "Bandas inválidas", labelEn: "Invalid bands", render: scene(invalidBands), frame },
  { id: "publishing", label: "Publicando", labelEn: "Publishing", render: scene(publishing), frame },
  { id: "publish-error", label: "Fallo al publicar", labelEn: "Publish error", render: scene(publishError, true), frame },
  { id: "readonly-role", label: "Solo lectura", labelEn: "Read only", render: scene(readonlyRole), frame },
  { id: "390", label: "390 px", labelEn: "390 px", render: scene(narrow390), frame: narrowFrame },
]
