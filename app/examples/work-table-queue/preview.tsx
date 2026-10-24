"use client"

import { WorkTableQueue } from "@/registry/blocks/work-table-queue"

export default function WorkTableQueuePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <WorkTableQueue />
    </div>
  )
}
