"use client"

import { Check, Circle } from "lucide-react"

import { AdaptiveTable, type AdaptiveColumn, type AdaptiveGroup } from "@/registry/ui/adaptive-table"

type Row = { id: string; name: string; amount: string }

const columns: AdaptiveColumn<Row>[] = [
  {
    id: "name",
    priority: 2,
    minWidth: 120,
    header: { icon: <Circle />, label: "Name" },
    render: (row) => row.name,
  },
  {
    id: "amount",
    priority: 1,
    minWidth: 70,
    mergeInto: "name",
    header: { icon: <Check />, label: "Amount" },
    render: (row) => row.amount,
    compactRender: (row) => row.amount,
  },
]

const groups: AdaptiveGroup<Row>[] = [
  {
    id: "intro",
    label: "Intro",
    icon: <Circle />,
    rows: [
      { id: "1", name: "Pebble Co", amount: "$1.8k" },
      { id: "2", name: "Marlowe", amount: "$640" },
    ],
  },
]

export default function AdaptiveTablePreview() {
  return (
    <div className="flex h-full items-start bg-muted/30 p-3">
      <div className="w-full max-w-sm">
        <AdaptiveTable title="Pipeline" columns={columns} groups={groups} getRowId={(row) => row.id} />
      </div>
    </div>
  )
}
