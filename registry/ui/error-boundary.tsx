"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/results/mode-error-boundary/mode-error-boundary.tsx

import * as React from "react"
import { AlertCircle, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type RetryAlertProps = {
  title?: string
  message?: string
  details?: string
  onRetry?: () => void
  onDismiss?: () => void
  retryLabel?: string
  className?: string
}

export function RetryAlert({
  title = "Something went wrong in this section",
  message,
  details,
  onRetry,
  onDismiss,
  retryLabel = "Try again",
  className,
}: RetryAlertProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <div role="alert" className={cn("flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm", className)}>
      <div className="flex items-start gap-2">
        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-destructive">{title}</p>
          {message ? <p className="text-foreground">{message}</p> : null}
        </div>
        {onDismiss ? (
          <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {onRetry ? (
          <Button type="button" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {details ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronDown aria-hidden="true" className="size-3" />
            Details
          </button>
        ) : null}
      </div>
      {open && details ? <pre className="max-h-32 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{details}</pre> : null}
    </div>
  )
}

type BoundaryProps = {
  children?: React.ReactNode
  fallback?: React.ReactNode | ((info: { error: Error; reset: () => void }) => React.ReactNode)
  onError?: (error: Error) => void
  resetKeys?: unknown[]
  className?: string
}

type BoundaryState = { error: Error | null }

export class ErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  componentDidUpdate(previous: BoundaryProps) {
    if (!this.state.error) return
    const keys = this.props.resetKeys ?? []
    const before = previous.resetKeys ?? []
    if (keys.length !== before.length || keys.some((key, index) => !Object.is(key, before[index]))) {
      this.reset()
    }
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (typeof this.props.fallback === "function") return this.props.fallback({ error, reset: this.reset })
    if (this.props.fallback) return this.props.fallback
    return <RetryAlert className={this.props.className} message={error.message} details={error.stack} onRetry={this.reset} />
  }
}
