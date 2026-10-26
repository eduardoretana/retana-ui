"use client"

import { useEffect, useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import { formatSceneCall, sceneText, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { atsLabelsEn, type AtsCandidate } from "@/registry/lib/ats"
import { CandidateCard } from "@/registry/ui/candidate-card"

import { canMove, empty, error, filled, followUpScorecard, loading, offer, stages, stagesEn, type TallerMeta } from "./fixtures"

type CardState = {
  candidate: AtsCandidate<TallerMeta>
  stageId: string
}

const frame: SceneFrame = { size: "sm", surface: "card", padding: "md" }

function CardScene({
  locale,
  log,
  initial,
  readOnly = false,
  failFirst = false,
}: SceneRenderProps & { initial: CardState; readOnly?: boolean; failFirst?: boolean }) {
  const sim = useSceneSim(initial, log)
  const attempt = useRef(0)
  const stageList = locale === "en" ? stagesEn : stages
  const name = sim.state.candidate.name
  return (
    <div className="flex flex-col gap-3">
      {sim.failed ? (
        <SceneStatus tone="error">
          {sceneText(
            locale,
            `No se guardó el cambio. ${name} sigue en la etapa anterior.`,
            `The move did not save. ${name} is still in the previous stage.`,
          )}
        </SceneStatus>
      ) : null}
      {sim.pending ? (
        <SceneStatus tone="loading">{sceneText(locale, "Guardando en el tablero…", "Saving on the board…")}</SceneStatus>
      ) : null}
      <CandidateCard
        candidate={sim.state.candidate}
        stageId={sim.state.stageId}
        stages={stageList}
        locale={locale === "en" ? "en-US" : "es-MX"}
        labels={locale === "en" ? atsLabelsEn : undefined}
        readOnly={readOnly}
        canMove={canMove}
        onOpen={(id) => log(formatSceneCall("onOpen", [id]))}
        onMoveCandidate={(id, from, to) => {
          attempt.current += 1
          const fail = failFirst && attempt.current === 1
          return sim.call(
            formatSceneCall("onMoveCandidate", [id, from, to]),
            (current) => ({ ...current, stageId: to }),
            (current) => ({
              ...current,
              candidate: {
                ...current.candidate,
                meta: { status: to as TallerMeta["status"], taller: current.candidate.meta?.taller ?? "Taller Ladrillo" },
              },
            }),
            { fail, delay: 650 },
          )
        }}
        onCreateAssessment={(id) => {
          void sim.call(formatSceneCall("onCreateAssessment", [id]), (current) => current, (current) => ({
            ...current,
            candidate: {
              ...current.candidate,
              scorecards: [...(current.candidate.scorecards ?? []), followUpScorecard],
            },
          }))
        }}
        renderActions={() => <span className="text-xs text-muted-foreground">WhatsApp</span>}
      />
    </div>
  )
}

function FilledScene(props: SceneRenderProps) {
  return <CardScene {...props} initial={{ candidate: filled, stageId: filled.meta?.status ?? "entrevista" }} />
}

function EmptyScene(props: SceneRenderProps) {
  return <CardScene {...props} initial={{ candidate: empty, stageId: "postulacion" }} />
}

function LoadingScene({ locale, log }: SceneRenderProps) {
  const sim = useSceneSim({ ready: false }, log)
  const call = sim.call
  useEffect(() => {
    void call("load", (current) => current, (current) => ({ ...current, ready: true }), { silent: true, delay: 800 })
  }, [call])
  if (!sim.state.ready) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
        <div className="h-8 rounded-md bg-muted" />
        <div className="h-3 w-2/3 rounded-md bg-muted" />
        <SceneStatus tone="loading">{sceneText(locale, "Cargando a Mariana Cuevas…", "Loading Mariana Cuevas…")}</SceneStatus>
      </div>
    )
  }
  return <CardScene locale={locale} log={log} initial={{ candidate: loading, stageId: "entrevista" }} />
}

function ErrorScene(props: SceneRenderProps) {
  return <CardScene {...props} initial={{ candidate: error, stageId: "entrevista" }} failFirst />
}

function ReadOnlyScene(props: SceneRenderProps) {
  return <CardScene {...props} initial={{ candidate: filled, stageId: "entrevista" }} readOnly />
}

function OfferScene(props: SceneRenderProps) {
  return <CardScene {...props} initial={{ candidate: offer, stageId: "oferta" }} />
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: FilledScene, frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: EmptyScene, frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: LoadingScene, frame },
  { id: "error", label: "Error", labelEn: "Error", render: ErrorScene, frame },
  { id: "readonly", label: "Solo lectura", labelEn: "Read only", render: ReadOnlyScene, frame },
  { id: "offer", label: "Oferta", labelEn: "Offer", render: OfferScene, frame },
]
