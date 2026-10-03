"use client"

import { EmptyState } from "@/registry/ui/empty-state"

export default function EmptyStatePreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <EmptyState title="Sin piezas" description="El horno está vacío." className="py-4" />
    </div>
  )
}
