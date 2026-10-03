"use client"

import { formatCurrency, formatDateLabel } from "@/registry/lib/multi-view"

export default function MultiViewCorePreview() {
  return (
    <div className="grid h-full content-center gap-1 bg-background p-3 text-sm">
      <p>{formatCurrency(42000, "en-US")}</p>
      <p>{formatCurrency(42000, "es-MX")}</p>
      <p>{formatDateLabel("2026-04-16", "es-MX")}</p>
    </div>
  )
}
