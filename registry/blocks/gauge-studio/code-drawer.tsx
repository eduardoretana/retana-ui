"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export const CodeDrawer = ({
  code,
  open,
  onOpenChange,
}: {
  code: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between gap-3 border-b px-4 py-3">
          <SheetTitle className="font-mono text-sm">custom-gauge.tsx</SheetTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void copy()}>
              {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </SheetHeader>
        <pre className="min-h-0 flex-1 overflow-auto px-4 py-4 font-mono text-xs leading-relaxed text-foreground">
          <code>{code}</code>
        </pre>
      </SheetContent>
    </Sheet>
  )
}
