"use client"

import { useState } from "react"

import { PipelineBoard } from "@/registry/blocks/pipeline-board"

import { demoCanMove, demoCandidates, demoGetStage, demoPeople, demoStages, type NubeStatus } from "../ats/data"

export function PipelineBoardDemo() {
  const [candidates, setCandidates] = useState(demoCandidates)
  return (
    <PipelineBoard
      className="h-full"
      candidates={candidates}
      stages={demoStages}
      getStage={demoGetStage}
      people={demoPeople}
      canMove={demoCanMove}
      onOpenCandidate={() => undefined}
      onCreateAssessment={() => undefined}
      onMoveCandidate={async (id, _from, to) => {
        setCandidates((current) =>
          current.map((candidate) => (candidate.id === id ? { ...candidate, meta: { status: to as NubeStatus } } : candidate)),
        )
      }}
      renderActions={(info) => <span className="text-xs text-muted-foreground">WhatsApp · {info.candidate.id}</span>}
    />
  )
}
