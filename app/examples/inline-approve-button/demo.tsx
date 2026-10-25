"use client"

import { useState } from "react"
import { toast } from "sonner"

import { InlineApproveButton, inlineApproveLabelsEn, type InlineApproveState } from "@/registry/ui/inline-approve-button"

export function InlineApproveButtonDemo() {
  const [state, setState] = useState<InlineApproveState>("idle")

  return (
    <div className="flex flex-col items-start gap-4">
      <InlineApproveButton
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 500))
          toast("El anfitrión guardó la aprobación.")
        }}
      />
      <InlineApproveButton
        state={state}
        onStateChange={setState}
        labels={inlineApproveLabelsEn}
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 300))
          if (state === "error") return
          throw new Error("demo")
        }}
      />
      <p className="text-xs text-muted-foreground">Estado controlado: {state}</p>
    </div>
  )
}
