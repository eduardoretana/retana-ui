"use client"

/** Section and article tree. The drop indicator shows the nesting level. */

import { demoTree } from "@/registry/retana/lib/work-table-demo"
import { WorkTableDemo, demoColumns, treeFooter } from "@/registry/retana/blocks/work-table-shared"

export function WorkTableTree({ className, state, errorMessage }: { className?: string; state?: "ready" | "loading" | "error"; errorMessage?: string }) {
  return (
    <WorkTableDemo
      rows={demoTree}
      mode="tree"
      columns={demoColumns()}
      persistenceKey="work-table-tree"
      paginate={false}
      summary={treeFooter}
      className={className}
      state={state}
      errorMessage={errorMessage}
    />
  )
}
