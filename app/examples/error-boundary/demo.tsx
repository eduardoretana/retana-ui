"use client"

import { RetryAlert } from "@/registry/ui/error-boundary"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <RetryAlert message="The shelf view failed to draw." onRetry={() => {}} />
    </div>
  )
}
