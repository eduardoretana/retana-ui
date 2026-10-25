"use client"

import { useState } from "react"

import type { AtsScorecardDraft } from "@/registry/lib/ats"
import { AssessmentForm } from "@/registry/ui/assessment-form"

import { demoCandidates, demoCriteria, demoPeople } from "../ats/data"

export function AssessmentFormDemo() {
  const [sent, setSent] = useState<AtsScorecardDraft | null>(null)
  const candidate = demoCandidates.find((item) => item.id === "luz") ?? demoCandidates[0]!
  return (
    <div className="grid gap-3">
      <div className="h-[640px] overflow-hidden rounded-xl border border-border">
        <AssessmentForm
          candidate={candidate}
          criteria={demoCriteria}
          author={demoPeople.find((person) => person.id === "mesa")}
          onSubmit={(scorecard) => setSent(scorecard)}
        />
      </div>
      {sent ? (
        <p className="text-sm text-muted-foreground" data-testid="sent-overall">
          {sent.verdict} · {sent.overall} · {sent.criteria.length} criterios
        </p>
      ) : null}
    </div>
  )
}
