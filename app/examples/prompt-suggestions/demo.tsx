"use client"

import { PromptSuggestions } from "@/registry/ui/prompt-suggestions"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <PromptSuggestions layout="wrap" items={["Resume the kiln log", "List the glaze tests", "Draft a shelf label"]} />
    </div>
  )
}
