"use client"

import { AssessmentForm } from "@/registry/ui/assessment-form"

import { demoCandidates, demoCriteria, demoPeople } from "../ats/data"

export default function Preview() {
  const candidate = demoCandidates.find((item) => item.id === "luz") ?? demoCandidates[0]!
  return (
    <div className="h-full overflow-hidden bg-background">
      <AssessmentForm candidate={candidate} criteria={demoCriteria} author={demoPeople[4]} />
    </div>
  )
}
