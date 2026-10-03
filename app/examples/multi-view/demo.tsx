"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { MultiView } from "@/registry/blocks/multi-view"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { collections, type CollectionId } from "./data"

export function MultiViewDemo() {
  const [collection, setCollection] = React.useState<CollectionId>("opportunities")
  const [locale, setLocale] = React.useState("es-MX")
  const source = collections[collection]
  const [records, setRecords] = React.useState<MultiRecord[]>(source.records)

  function choose(id: CollectionId) {
    setCollection(id)
    setRecords(collections[id].records.map((record) => ({ ...record })))
  }

  return (
    <ExampleFrame
      wide
      title="Multi-view"
      description="Una colección, varias vistas. Los datos son ficticios y viven en esta página."
    >
      <div className="flex flex-wrap gap-2">
        {(Object.keys(collections) as CollectionId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === collection}
            className="rounded-md border border-border px-2 py-1 text-sm data-[on=true]:bg-muted"
            data-on={id === collection}
            onClick={() => choose(id)}
          >
            {collections[id].title}
          </button>
        ))}
        <button type="button" className="rounded-md border border-border px-2 py-1 text-sm" onClick={() => setLocale((value) => (value === "es-MX" ? "en-US" : "es-MX"))}>
          {locale}
        </button>
      </div>
      <MultiView
        title={source.title}
        records={records}
        fields={source.fields}
        views={source.views}
        locale={locale}
        today="2026-04-03"
        tabs={[
          { id: "activity", label: "Activity", content: () => <p className="text-sm text-muted-foreground">No activity yet.</p> },
          { id: "notes", label: "Notes", content: () => <p className="text-sm text-muted-foreground">Notes stay in the host.</p> },
        ]}
        onRecordChange={async (id, patch) => {
          setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
        }}
        onCreate={async (draft) => {
          setRecords((current) => [...current, { id: `new-${current.length + 1}`, ...draft }])
        }}
        onDelete={async (ids) => {
          const drop = new Set(ids)
          setRecords((current) => current.filter((record) => !drop.has(record.id)))
        }}
        onMove={async (id, patch) => {
          setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
        }}
      />
    </ExampleFrame>
  )
}
