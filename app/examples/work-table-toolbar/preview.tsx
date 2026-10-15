"use client"

import { useState } from "react"

import { demoCycles, demoPeople } from "@/registry/lib/work-table-demo"
import { WorkTableToolbar } from "@/registry/ui/work-table-toolbar"
import type { WorkPriority, WorkSortDir, WorkSortKey } from "@/registry/lib/work-table"

export function ToolbarDemo({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const [priorities, setPriorities] = useState<WorkPriority[]>(["p1"])
  const [assignees, setAssignees] = useState<string[]>(["ana"])
  const [cycle, setCycle] = useState<string | null>("c25")
  const [sortKey, setSortKey] = useState<WorkSortKey>("manual")
  const [sortDir, setSortDir] = useState<WorkSortDir>("asc")
  const [expanded, setExpanded] = useState(false)

  return (
    <WorkTableToolbar
      className={className}
      query={query}
      onQueryChange={setQuery}
      priorities={priorities}
      onPrioritiesChange={setPriorities}
      people={demoPeople}
      assignees={assignees}
      onAssigneesChange={setAssignees}
      cycles={demoCycles}
      cycle={cycle}
      onCycleChange={setCycle}
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => {
        setSortKey(key)
        setSortDir(dir)
      }}
      expanded={expanded}
      onExpand={() => setExpanded((value) => !value)}
      onReset={() => {
        setQuery("")
        setPriorities([])
        setAssignees([])
        setCycle(null)
        setSortKey("manual")
        setSortDir("asc")
      }}
      onRestore={() => {
        setSortKey("manual")
        setSortDir("asc")
      }}
    />
  )
}

export default function WorkTableToolbarPreview() {
  return (
    <div className="bg-background p-3">
      <ToolbarDemo />
    </div>
  )
}
