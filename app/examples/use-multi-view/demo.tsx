"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunityViews } from "@/app/examples/multi-view/data"
import { createHistoryAdapter, useMultiView } from "@/registry/hooks/use-multi-view"

export function UseMultiViewDemo() {
  const url = React.useMemo(() => createHistoryAdapter(), [])
  const state = useMultiView({ views: opportunityViews, url })
  return (
    <ExampleFrame title="useMultiView" description="Vista, búsqueda y selección, con un adaptador de history.">
      <label className="grid gap-1 text-sm">
        Search
        <input
          aria-label="Search"
          value={state.query}
          onChange={(event) => state.setQuery(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {state.views.map((view) => (
          <button key={view.id} type="button" aria-pressed={view.id === state.viewId} className="rounded-md border border-border px-2 py-1 text-sm" onClick={() => state.setViewId(view.id)}>
            {view.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {state.viewId} · {state.query || "empty query"} · {state.selectedIds.length} selected
      </p>
      <button type="button" className="text-sm underline" onClick={() => state.toggleSelected("op-bruma")}>
        Toggle Bruma
      </button>
    </ExampleFrame>
  )
}
