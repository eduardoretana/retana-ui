"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  demoCycles,
  demoPeople,
  demoStatuses,
  DEMO_NOW,
  type DemoWork,
} from "@/registry/retana/lib/work-table-demo"
import {
  WorkDueCell,
  WorkEffortCell,
  WorkNumberCell,
  WorkPersonCell,
  WorkPriorityCell,
  WorkRankCell,
  WorkSlaCell,
  WorkStatusCell,
  WorkTitleCell,
} from "@/registry/retana/ui/work-table-cells"
import { WorkTableToolbar } from "@/registry/retana/ui/work-table-toolbar"
import {
  WorkTable,
  filterWorkRows,
  mergeRows,
  sortWorkRows,
  treeSummary,
  useWorkCollection,
  useWorkTableLayout,
  withSequentialRank,
  type WorkColumn,
  type WorkMove,
  type WorkSortDir,
  type WorkSortKey,
} from "@/registry/retana/ui/work-table"

const personById = new Map(demoPeople.map((person) => [person.id, person]))
const statusById = new Map(demoStatuses.map((status) => [status.id, status]))

export function demoColumns(options: { rank?: boolean; sla?: boolean; numbers?: boolean } = {}): WorkColumn<DemoWork>[] {
  const columns: WorkColumn<DemoWork>[] = [
    {
      id: "title",
      header: "Trabajo",
      locked: true,
      cell: (row) => <WorkTitleCell title={row.title} code={row.code} kind={row.kind} />,
    },
    {
      id: "assignee",
      header: "Responsable",
      cell: (row) => <WorkPersonCell person={row.assigneeId ? personById.get(row.assigneeId) : null} />,
    },
    {
      id: "priority",
      header: "Prioridad",
      cell: (row) => <WorkPriorityCell priority={row.priority} />,
    },
    {
      id: "due",
      header: "Fecha",
      cell: (row) => <WorkDueCell value={row.due} now={DEMO_NOW} />,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => {
        const status = statusById.get(row.statusId)
        const appearance = row.statusId === "done" ? "outline" : row.statusId === "todo" ? "text" : "soft"
        return <WorkStatusCell label={status?.label ?? row.statusId} tone={status?.tone} appearance={appearance} />
      },
    },
  ]
  if (options.sla) {
    columns.push({
      id: "sla",
      header: "SLA",
      cell: (row) => <WorkSlaCell value={row.slaDue} now={DEMO_NOW} />,
    })
  }
  columns.push({
    id: "effort",
    header: "Esfuerzo",
    cell: (row) => <WorkEffortCell points={row.effort} />,
  })
  if (options.numbers) {
    columns.push(
      { id: "views", header: "Vistas", align: "end", cell: (row) => <WorkNumberCell value={row.views} /> },
      { id: "share", header: "Parte", align: "end", cell: (row) => <WorkNumberCell value={row.share} kind="percent" /> },
      { id: "minutes", header: "Tiempo", align: "end", cell: (row) => <WorkNumberCell value={row.minutes} kind="minutes" /> },
    )
  }
  if (options.rank) {
    columns.push({
      id: "rank",
      header: "Rango",
      locked: true,
      cell: (_row, index) => <WorkRankCell rank={index + 1} />,
    })
  }
  return columns
}

export function WorkTableDemo({
  rows,
  mode,
  columns,
  persistenceKey,
  groupLimit = 3,
  paginate,
  summary,
  className,
  state,
  errorMessage,
}: {
  rows: readonly DemoWork[]
  mode: "flat" | "grouped" | "tree"
  columns: readonly WorkColumn<DemoWork>[]
  persistenceKey: string
  groupLimit?: number
  paginate?: boolean
  summary?: (rows: readonly DemoWork[]) => React.ReactNode
  className?: string
  state?: "ready" | "loading" | "error"
  errorMessage?: string
}) {
  const collection = useWorkCollection(rows)
  const layout = useWorkTableLayout({ columnIds: columns.map((column) => column.id), persistenceKey })
  const [query, setQuery] = React.useState("")
  const [priorities, setPriorities] = React.useState<DemoWork["priority"][]>([])
  const [assignees, setAssignees] = React.useState<string[]>([])
  const [cycle, setCycle] = React.useState<string | null>(null)
  const [sortKey, setSortKey] = React.useState<WorkSortKey>("manual")
  const [sortDir, setSortDir] = React.useState<WorkSortDir>("asc")
  const [expanded, setExpanded] = React.useState(false)

  const visible = sortWorkRows(
    filterWorkRows(collection.rows, {
      query,
      text: (row) => `${row.title} ${row.code} ${row.kind}`,
      priorities,
      priority: (row) => row.priority,
      assignees,
      assignee: (row) => row.assigneeId,
      cycle,
      getCycle: (row) => row.cycle,
    }),
    sortKey,
    sortDir,
    { due: (row) => row.due, priority: (row) => row.priority, effort: (row) => row.effort },
  )

  function handleMove(event: WorkMove<DemoWork>) {
    setSortKey("manual")
    collection.setRows((current) => withSequentialRank(mergeRows(current, event.rows)))
  }

  return (
    <div data-slot="work-demo" className={cn("flex flex-col gap-3", className)}>
      <WorkTableToolbar
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
        onReset={() => {
          setQuery("")
          setPriorities([])
          setAssignees([])
          setCycle(null)
          setSortKey("manual")
          setSortDir("asc")
        }}
        onExpand={() => setExpanded((current) => !current)}
        onRestore={() => layout.restorePreset()}
      />
      <WorkTable
        rows={visible}
        columns={columns}
        mode={mode}
        statuses={demoStatuses}
        getStatusId={(row) => row.statusId}
        setStatusId={(row, statusId) => ({ ...row, statusId })}
        getParentId={(row) => row.parentId}
        setParentId={(row, parentId) => ({ ...row, parentId })}
        getEffort={(row) => row.effort}
        getAssigneeId={(row) => row.assigneeId}
        getRowLabel={(row) => row.title}
        groupLimit={groupLimit}
        groupsExpanded={expanded}
        people={demoPeople}
        paginate={paginate}
        persistenceKey={persistenceKey}
        layoutApi={layout}
        state={state}
        errorMessage={errorMessage}
        onMove={handleMove}
        onAssign={(ids, personId) => collection.assign(ids, personId, "assigneeId")}
        onRemove={collection.remove}
        onUpdate={collection.update}
        summary={summary}
      />
    </div>
  )
}

export function treeFooter(rows: readonly DemoWork[]) {
  const summary = treeSummary(rows, (row) => row.parentId)
  return (
    <span className="text-sm text-muted-foreground">
      {summary.sections} secciones · {summary.articles} artículos · {summary.points} pts
    </span>
  )
}
