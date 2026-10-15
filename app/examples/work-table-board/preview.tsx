"use client"

import { WorkTableBoard } from "@/registry/blocks/work-table-board"

export default function WorkTableBoardPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <WorkTableBoard />
    </div>
  )
}
