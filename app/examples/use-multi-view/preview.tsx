"use client"

import { opportunityViews } from "@/app/examples/multi-view/data"
import { useMultiView } from "@/registry/hooks/use-multi-view"

export default function UseMultiViewPreview() {
  const state = useMultiView({ views: opportunityViews, defaultQuery: "bruma" })
  return (
    <div className="grid h-full content-center gap-2 bg-background p-3 text-sm">
      <p>{state.viewId}</p>
      <p>{state.query}</p>
    </div>
  )
}
