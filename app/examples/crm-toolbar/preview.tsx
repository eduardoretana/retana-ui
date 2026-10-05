"use client"

import { useState } from "react"

import { CrmToolbar } from "@/registry/ui/crm-toolbar"

import { crmSegments, crmToolbarLabels } from "../crm-labels"

export default function CrmToolbarPreview() {
  const [query, setQuery] = useState("")
  const [segment, setSegment] = useState("all")
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <CrmToolbar
        query={query}
        onQueryChange={setQuery}
        segment={segment}
        onSegmentChange={setSegment}
        segments={crmSegments}
        labels={crmToolbarLabels}
        facets={[{ id: "region", label: "Región", options: [{ value: "oaxaca", label: "Oaxaca" }] }]}
      />
    </div>
  )
}
