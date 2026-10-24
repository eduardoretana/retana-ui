"use client"

import { WorkTableTree } from "@/registry/blocks/work-table-tree"

export default function WorkTableTreePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <WorkTableTree />
    </div>
  )
}
