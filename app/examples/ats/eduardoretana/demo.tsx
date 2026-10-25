"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Ats } from "@/registry/blocks/ats"
import type { AtsCandidate, AtsInterviewSlot, AtsScorecardDraft, AtsSlotInfo } from "@/registry/lib/ats"
import { StageProgress } from "@/registry/ui/stage-progress"

import {
  applyMove,
  retanaCanMove,
  retanaCandidates,
  retanaCriteria,
  retanaGetStage,
  retanaJob,
  retanaNow,
  retanaPeople,
  retanaProcessLink,
  retanaStages,
  retanaTrackStages,
  retanaWhatsAppHref,
  type RetanaMeta,
} from "./data"

export function RetanaAtsDemo() {
  const [candidates, setCandidates] = useState<AtsCandidate<RetanaMeta>[]>(retanaCandidates)
  const sequence = useRef(0)

  function nextId(prefix: string) {
    sequence.current += 1
    return `${prefix}-${sequence.current}`
  }

  async function move(id: string, _from: string, to: string) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id && candidate.meta ? { ...candidate, meta: applyMove(candidate.meta, to) } : candidate,
      ),
    )
  }

  function submit(id: string, scorecard: AtsScorecardDraft) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              scorecards: [
                ...(candidate.scorecards ?? []),
                {
                  ...scorecard,
                  id: nextId("score"),
                  authorId: "mesa",
                  createdAt: retanaNow,
                  stageId: retanaGetStage(candidate),
                },
              ],
            }
          : candidate,
      ),
    )
  }

  function note(id: string, body: string) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              notes: [...(candidate.notes ?? []), { id: nextId("note"), authorId: "mesa", body, createdAt: retanaNow }],
            }
          : candidate,
      ),
    )
  }

  function schedule(id: string, slot: AtsInterviewSlot) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              interviews: [...(candidate.interviews ?? []), { id: nextId("meet"), ...slot }],
              nextStep: { label: slot.kind || "Entrevista", at: slot.startsAt },
            }
          : candidate,
      ),
    )
  }

  function progress(info: AtsSlotInfo<RetanaMeta>) {
    const stages = retanaTrackStages(info.stageId, info.stages)
    const label = stages.find((stage) => stage.id === info.stageId)?.label ?? info.stageId
    return <StageProgress stages={stages} stageId={info.stageId} label={label} />
  }

  function actions(info: AtsSlotInfo<RetanaMeta>) {
    const href = retanaWhatsAppHref(info.candidate)
    return (
      <>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!href) {
              toast("Sin teléfono")
              return
            }
            window.open(href, "_blank", "noopener,noreferrer")
          }}
        >
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const link = retanaProcessLink(info.candidate.id)
            void navigator.clipboard.writeText(link).then(
              () => toast("Enlace copiado"),
              () => toast("No se pudo copiar el enlace"),
            )
          }}
        >
          Copiar enlace
        </Button>
      </>
    )
  }

  return (
    <Ats
      className="h-full min-h-0"
      job={retanaJob}
      candidates={candidates}
      stages={retanaStages}
      getStage={retanaGetStage}
      people={retanaPeople}
      criteria={retanaCriteria}
      author={retanaPeople.find((person) => person.id === "mesa")}
      canMove={retanaCanMove}
      now={retanaNow}
      locale="es-MX"
      timeZone="America/Mexico_City"
      defaultSelectedId={null}
      onMoveCandidate={move}
      onSubmitScorecard={submit}
      onScheduleInterview={schedule}
      onSendEmail={(id) => {
        const name = candidates.find((candidate) => candidate.id === id)?.name ?? id
        toast(`Correo listo para ${name}`)
      }}
      onAddNote={note}
      onOpenCandidate={() => undefined}
      onShare={() => toast("Enlace de contrataciones copiado en la demostración")}
      onFilterChange={() => undefined}
      renderProgress={progress}
      renderActions={actions}
    />
  )
}
