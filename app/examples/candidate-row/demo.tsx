"use client"

import { useState } from "react"

import { defaultAtsSort, type AtsSort } from "@/registry/lib/ats"
import { CandidateTable } from "@/registry/ui/candidate-row"

import { demoCandidates, demoGetStage, demoPeople, demoStages } from "../ats/data"

export function CandidateRowDemo() {
  const [sort, setSort] = useState<AtsSort>(defaultAtsSort)
  const [selected, setSelected] = useState<string[]>([])
  return (
    <CandidateTable
      candidates={demoCandidates}
      stages={demoStages}
      getStage={demoGetStage}
      people={demoPeople}
      sort={sort}
      onSortChange={setSort}
      selectedIds={selected}
      onToggle={(id, on) => setSelected((current) => (on ? [...current, id] : current.filter((item) => item !== id)))}
      onToggleAll={(on, ids) => setSelected(on ? ids : [])}
      onOpen={() => undefined}
    />
  )
}
