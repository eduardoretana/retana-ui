"use client"

import { useState } from "react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { CrmToolbar } from "@/registry/ui/crm-toolbar"
import type { CrmFacetSelection } from "@/registry/lib/crm-companies"

import { crmSegments, crmToolbarLabels } from "../../crm-labels"

function Bar({
  width,
  facets,
}: {
  width?: number
  facets?: { id: string; label: string; options: { value: string; label: string }[] }[]
}) {
  const [query, setQuery] = useState("")
  const [segment, setSegment] = useState("all")
  const [selection, setSelection] = useState<CrmFacetSelection>({})
  return (
    <div style={width ? { width } : undefined}>
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
    </div>
  )
}

const longFacet = {
  id: "region",
  label: unbreakable,
  options: Array.from({ length: 12 }, (_, index) => ({ value: `v${index}`, label: index === 0 ? unbreakable : `Región ${index}` })),
}

export default function CrmToolbarStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · barra de empresas</h1>
          <p className="mt-2 text-sm text-muted-foreground">320px abre el panel. También vacío, una faceta larga y RTL.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <Bar facets={[longFacet]} />
      </StressCase>
      <StressCase label="Sin facetas">
        <Bar />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Bar facets={[{ id: "city", label: "المدينة", options: [{ value: "a", label: "أواكساكا" }] }]} />
        </div>
      </StressCase>
      <StressCase label="Con un hermano">
        <div className="flex min-w-0 gap-3">
          <div className="w-16 shrink-0 rounded-lg border border-border" />
          <div className="min-w-0 flex-1">
            <Bar facets={[longFacet]} />
          </div>
        </div>
      </StressCase>
    </main>
  )
}
