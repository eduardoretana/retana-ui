"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/in-message-error/in-message-error.tsx

import * as React from "react"
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function extractErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error == null) return fallback
  if (typeof error === "string") return error || fallback
  if (error instanceof Error) return error.message || fallback
  if (typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
    return error.message
  }
  return fallback
}

export type MessageErrorClassNames = {
  root?: string
  title?: string
  details?: string
}

export type MessageErrorProps = {
  error: unknown
  details?: string
  onRetry?: () => void
  retrying?: boolean
  title?: string
  retryLabel?: string
  className?: string
  classNames?: MessageErrorClassNames
}

export function MessageError({
  error,
  details,
  onRetry,
  retrying = false,
  title,
  retryLabel = "Retry",
  className,
  classNames,
}: MessageErrorProps) {
  const message = title ?? extractErrorMessage(error)
  const alertRef = React.useRef(true)
  const [alert, setAlert] = React.useState(true)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!alertRef.current) return
    alertRef.current = false
    const timer = window.setTimeout(() => setAlert(false), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      role={alert ? "alert" : "group"}
      className={cn("flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm", className, classNames?.root)}
    >
      <div className="flex items-start gap-2">
        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className={cn("min-w-0 flex-1 text-foreground", classNames?.title)}>
          <span className="font-medium text-destructive">{message}</span>
        </p>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" disabled={retrying} onClick={onRetry}>
            {retrying ? <Loader2 data-icon="inline-start" className="animate-spin motion-reduce:animate-none" /> : null}
            {retryLabel}
          </Button>
        ) : null}
      </div>
      {details ? (
        <div className={classNames?.details}>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronDown aria-hidden="true" className={cn("size-3", open && "rotate-180")} />
            Details
          </button>
          {open ? <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-muted p-2 font-mono text-xs text-foreground">{details}</pre> : null}
        </div>
      ) : null}
    </div>
  )
}
