"use client"

import { CandidateCard } from "@/registry/ui/candidate-card"

import { demoCandidates, demoGetStage, demoStages } from "../ats/data"

export default function Preview() {
  const candidate = demoCandidates[0]!
  return (
    <div className="grid h-full content-center bg-background p-4">
      <div className="max-w-sm">
        <CandidateCard candidate={candidate} stageId={demoGetStage(candidate)} stages={demoStages} />
      </div>
    </div>
  )
}
