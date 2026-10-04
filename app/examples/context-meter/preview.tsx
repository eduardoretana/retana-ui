"use client"

import { ContextMeter } from "@/registry/ui/context-meter"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <ContextMeter used={12400} contextWindow={32000} usage={{ input: 8000, output: 2800, reasoning: 1200, cached: 400 }} />
    </div>
  )
}
