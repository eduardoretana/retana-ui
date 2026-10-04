"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/media-vision/image-processing-overlay/image-processing-overlay.tsx

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ScanOverlayProps = {
  active?: boolean
  variant?: "spinner" | "scan"
  status?: string
  detail?: string
  onCancel?: () => void
  children?: React.ReactNode
  className?: string
}

export function ScanOverlay({
  active = true,
  variant = "scan",
  status = "Processing…",
  detail,
  onCancel,
  children,
  className,
}: ScanOverlayProps) {
  return (
    <div aria-busy={active} className={cn("relative overflow-hidden", className)}>
      {children}
      {active ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 p-4 text-center backdrop-blur-sm">
          {variant === "scan" ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40 motion-reduce:hidden"
              style={{
                backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px)",
                backgroundSize: "100% 12px",
              }}
            />
          ) : null}
          <p role="status" className="relative flex items-center gap-2 text-sm text-foreground">
            {variant === "spinner" ? <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:hidden" /> : null}
            <span className={variant === "spinner" ? "motion-reduce:inline hidden motion-reduce:block" : undefined}>{status}</span>
            {variant === "spinner" ? <span className="motion-reduce:hidden">{status}</span> : null}
          </p>
          {detail ? <p className="relative text-xs text-muted-foreground">{detail}</p> : null}
          {onCancel ? (
            <Button type="button" size="sm" variant="outline" className="relative" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
