"use client"

import { useState } from "react"

import { useOptimisticStage } from "@/registry/hooks/use-optimistic-stage"
import { CandidateDetail } from "@/registry/ui/candidate-detail"

import { demoCanMove, demoCandidates, demoCriteria, demoGetStage, demoPeople, demoStages, type NubeStatus } from "../ats/data"

export function CandidateDetailDemo() {
  const [candidates, setCandidates] = useState(demoCandidates)
  const [index, setIndex] = useState(0)
  const { resolve, move } = useOptimisticStage(candidates, demoGetStage, {
    canMove: demoCanMove,
    onMoveCandidate: async (id, _from, to) => {
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === id ? { ...candidate, meta: { status: to as NubeStatus } } : candidate)),
      )
    },
  })
  const candidate = candidates[index] ?? candidates[0]!
  return (
    <div className="h-[760px] overflow-hidden rounded-xl border border-border">
      <CandidateDetail
        candidate={candidate}
        stageId={resolve(candidate)}
        stages={demoStages}
        people={demoPeople}
        criteria={demoCriteria}
        position={index + 1}
        total={candidates.length}
        canMove={demoCanMove}
        onPrevious={index > 0 ? () => setIndex(index - 1) : undefined}
        onNext={index < candidates.length - 1 ? () => setIndex(index + 1) : undefined}
        onMoveCandidate={move}
        onSendEmail={() => undefined}
        onScheduleInterview={() => undefined}
        onAddNote={(id, body) => {
          setCandidates((current) =>
            current.map((item) =>
              item.id === id
                ? { ...item, notes: [...(item.notes ?? []), { id: `note-${item.notes?.length ?? 0}`, authorId: "mesa", body, createdAt: "2026-10-25T18:00:00.000Z" }] }
                : item,
            ),
          )
        }}
        onCreateAssessment={() => undefined}
        renderActions={() => <span className="text-xs text-muted-foreground">Copiar enlace</span>}
      />
    </div>
  )
}
