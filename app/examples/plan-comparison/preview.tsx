"use client"

import { PlanComparison } from "@/registry/blocks/plan-comparison"

export default function PlanComparisonPreview() {
  return (
    <div className="h-full overflow-auto bg-background p-3">
      <PlanComparison />
    </div>
  )
}
