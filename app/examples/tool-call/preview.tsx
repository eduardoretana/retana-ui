"use client"

import { ToolCall, ToolCallGroup } from "@/registry/ui/tool-call"

const calls = [
  { id: "a", name: "lookup_glaze", status: "completed" as const, input: { kiln: "bruma", cone: "6" }, output: { hold: "20 min" }, startedAt: Date.now() - 4000, endedAt: Date.now() - 2200 },
  { id: "b", name: "weigh_batch", status: "running" as const, input: { clay: "gres" }, startedAt: Date.now() - 1500 },
]

export default function Preview() {
  return (
    <div className="flex flex-col gap-3 bg-background p-3">
      <ToolCall call={calls[0]} defaultOpen />
      <ToolCallGroup calls={calls} />
    </div>
  )
}
