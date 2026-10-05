"use client"

import { useState } from "react"

import { CrmToolbar } from "@/registry/ui/crm-toolbar"
import type { CrmFacetSelection } from "@/registry/lib/crm-companies"

import { crmSegments, crmToolbarLabels } from "../crm-labels"

const facets = [
  {
    id: "region",
    label: "Región",
    options: [
      { value: "Oaxaca", label: "Oaxaca" },
      { value: "Ciudad de México", label: "Ciudad de México" },
      { value: "Guadalajara", label: "Guadalajara" },
    ],
  },
  {
    id: "industry",
    label: "Giro",
    options: [
      { value: "Cerámica", label: "Cerámica" },
      { value: "Alimentos", label: "Alimentos" },
    ],
  },
]

export function Demo() {
  const [query, setQuery] = useState("")
  const [segment, setSegment] = useState("all")
  const [selection, setSelection] = useState<CrmFacetSelection>({})
  return (
    <CrmToolbar
      query={query}
      onQueryChange={setQuery}
      segment={segment}
      onSegmentChange={setSegment}
      segments={crmSegments}
      facets={facets}
      selection={selection}
      onSelectionChange={setSelection}
      labels={crmToolbarLabels}
    />
  )
}
