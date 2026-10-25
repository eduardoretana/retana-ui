"use client"

import { CandidateDetail } from "@/registry/ui/candidate-detail"

import { demoCandidates, demoCriteria, demoGetStage, demoPeople, demoStages } from "../ats/data"

export default function Preview() {
  const candidate = demoCandidates[0]!
  return (
    <div className="h-full overflow-hidden bg-background">
      <CandidateDetail
        candidate={candidate}
        stageId={demoGetStage(candidate)}
        stages={demoStages}
        people={demoPeople}
        criteria={demoCriteria}
        position={2}
        total={14}
      />
    </div>
  )
}
