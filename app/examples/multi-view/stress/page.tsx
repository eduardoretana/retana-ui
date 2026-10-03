"use client"

import { MultiView } from "@/registry/blocks/multi-view"
import { collections, type CollectionId } from "../data"
import { StressShell } from "../stress-shell"

export default function MultiViewStressPage() {
  return (
    <StressShell title="Multi-view stress" kind="opportunities">
      {(records) => (
        <CollectionSwitch records={records} />
      )}
    </StressShell>
  )
}

function CollectionSwitch({ records }: { records: { id: string }[] }) {
  const kind: CollectionId = "opportunities"
  const source = collections[kind]
  return (
    <MultiView
      title={source.title}
      records={records}
      fields={source.fields}
      views={source.views}
      locale="es-MX"
      today="2026-04-03"
    />
  )
}
