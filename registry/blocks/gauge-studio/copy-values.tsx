"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { withoutMeta, type PanelValues } from "@/registry/retana/ui/gauge-kit"

export const CopyValuesButton = ({ values }: { values: PanelValues }) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(withoutMeta(values), null, 2))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon-xs" variant="ghost" onClick={() => void copy()} aria-label="Copy controls as JSON">
          {copied ? <Check /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{copied ? "Copied" : "Copy controls as JSON"}</TooltipContent>
    </Tooltip>
  )
}
