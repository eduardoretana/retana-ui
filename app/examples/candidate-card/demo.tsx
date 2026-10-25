"use client"

import { useState } from "react"

import { useOptimisticStage } from "@/registry/hooks/use-optimistic-stage"
import { CandidateCard } from "@/registry/ui/candidate-card"

import { demoCanMove, demoCandidates, demoGetStage, demoStages, type NubeMeta, type NubeStatus } from "../ats/data"

export function CandidateCardDemo() {
  const [candidates, setCandidates] = useState(demoCandidates.slice(0, 1))
  const { resolve, move } = useOptimisticStage(candidates, demoGetStage, {
    canMove: demoCanMove,
    onMoveCandidate: async (id, _from, to) => {
      setCandidates((current) =>
        current.map((candidate) => (candidate.id === id ? { ...candidate, meta: { status: to as NubeStatus } } : candidate)),
      )
    },
  })
  const candidate = candidates[0]!
  return (
    <div className="max-w-sm">
      <CandidateCard
        candidate={candidate}
        stageId={resolve(candidate)}
        stages={demoStages}
        canMove={demoCanMove}
        onOpen={() => undefined}
        onMoveCandidate={move}
        onCreateAssessment={() => undefined}
        renderActions={() => <span className="text-xs text-muted-foreground">WhatsApp</span>}
      />
    </div>
  )
}

export type { NubeMeta }
