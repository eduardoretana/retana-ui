"use client"

import { WorkTableSupport } from "@/registry/blocks/work-table-support"

export default function WorkTableSupportPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-3">
      <WorkTableSupport />
    </div>
  )
}
