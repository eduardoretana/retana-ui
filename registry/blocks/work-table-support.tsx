"use client"

/** Support queue with bulk move and SLA. */

import { demoSupport } from "@/registry/retana/lib/work-table-demo"
import { WorkTableDemo, demoColumns } from "@/registry/retana/blocks/work-table-shared"

export function WorkTableSupport({ className, state, errorMessage }: { className?: string; state?: "ready" | "loading" | "error"; errorMessage?: string }) {
  return (
    <WorkTableDemo
      rows={demoSupport}
      mode="flat"
      columns={demoColumns({ sla: true })}
      persistenceKey="work-table-support"
      paginate
      className={className}
      state={state}
      errorMessage={errorMessage}
    />
  )
}
