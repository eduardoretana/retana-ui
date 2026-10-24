"use client"

/** Grouped board. Dragging a row into another group changes its status. */

import { demoBoard } from "@/registry/retana/lib/work-table-demo"
import { WorkTableDemo, demoColumns } from "@/registry/retana/blocks/work-table-shared"

export function WorkTableBoard({ className, state, errorMessage }: { className?: string; state?: "ready" | "loading" | "error"; errorMessage?: string }) {
  return (
    <WorkTableDemo
      rows={demoBoard}
      mode="grouped"
      columns={demoColumns({ numbers: true })}
      persistenceKey="work-table-board"
      groupLimit={3}
      paginate={false}
      className={className}
      state={state}
      errorMessage={errorMessage}
    />
  )
}
