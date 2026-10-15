"use client"

/** Flat queue. Rank follows the manual order. */

import { demoQueue } from "@/registry/retana/lib/work-table-demo"
import { WorkTableDemo, demoColumns } from "@/registry/retana/blocks/work-table-shared"

export function WorkTableQueue({ className, state, errorMessage }: { className?: string; state?: "ready" | "loading" | "error"; errorMessage?: string }) {
  return (
    <WorkTableDemo
      rows={demoQueue}
      mode="flat"
      columns={demoColumns({ rank: true, numbers: true })}
      persistenceKey="work-table-queue"
      paginate
      className={className}
      state={state}
      errorMessage={errorMessage}
    />
  )
}
