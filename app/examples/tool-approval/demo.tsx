"use client"

import { ToolApproval } from "@/registry/ui/tool-approval"

export function Demo() {
  return (
    <div className="bg-background p-3">
      <ToolApproval
        toolName="archive_shelf"
        reason="Moves the unfinished shelf out of the active queue."
        risk="high"
        args={{ shelf: "north", note: "A very long note about the unfinished bowls that should stay clamped until someone asks to read the rest of the sentence." }}
        onAlwaysAllowChange={() => {}}
      />
    </div>
  )
}
