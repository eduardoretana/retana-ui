"use client"

import { InlineApproveButton } from "@/registry/ui/inline-approve-button"

export default function Preview() {
  return (
    <div className="flex h-full items-center bg-background p-6">
      <InlineApproveButton onConfirm={() => undefined} />
    </div>
  )
}
