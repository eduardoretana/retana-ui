"use client"

import { InViewTitle } from "@/registry/ui/in-view-title"

export default function InViewTitlePreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <InViewTitle text="Barro de la costa" className="text-lg font-semibold" />
    </div>
  )
}
