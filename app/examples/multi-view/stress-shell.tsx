"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { scaleRecords, type CollectionId } from "./data"

const SCALES = ["0", "1", "real", "10x", "200"] as const

export function StressShell({
  title,
  kind,
  children,
}: {
  title: string
  kind: CollectionId
  children: (records: MultiRecord[]) => React.ReactNode
}) {
  const [scale, setScale] = React.useState<(typeof SCALES)[number]>("real")
  const records = React.useMemo(() => scaleRecords(kind, scale), [kind, scale])
  return (
    <ExampleFrame wide title={title} description="320px, columna apretada y ancho. Cambia la cantidad de filas.">
      <div className="flex flex-wrap gap-2">
        {SCALES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === scale}
            className="rounded-md border border-border px-2 py-1 text-sm"
            onClick={() => setScale(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px</h2>
        <div className="w-[320px] max-w-full overflow-hidden rounded-lg border border-border p-2">
          {children(records)}
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Squeezed by a sibling</h2>
        <div className="flex min-w-0 gap-3">
          <div className="w-24 shrink-0 rounded-lg bg-muted p-2 text-xs text-muted-foreground">Sibling</div>
          <div className="min-w-0 flex-1 rounded-lg border border-border p-2">{children(records)}</div>
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Wide</h2>
        <div className="w-[1200px] max-w-none rounded-lg border border-border p-2">{children(records)}</div>
      </section>
    </ExampleFrame>
  )
}
