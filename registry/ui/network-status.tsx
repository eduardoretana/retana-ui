"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/local-first/network-badge/network-badge.tsx

import * as React from "react"
import { Check, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNetworkStatus } from "@/registry/retana/hooks/use-device-capabilities"

export type NetworkStatusClassNames = {
  root?: string
  dot?: string
  banner?: string
}

export type NetworkStatusProps = {
  variant?: "badge" | "banner"
  offlineReady?: boolean
  onRetry?: () => void
  onlineLabel?: string
  offlineLabel?: string
  readyLabel?: string
  retryLabel?: string
  className?: string
  classNames?: NetworkStatusClassNames
}

export function NetworkStatus({
  variant = "badge",
  offlineReady = false,
  onRetry,
  onlineLabel = "Online",
  offlineLabel = "Offline",
  readyLabel = "Works offline",
  retryLabel = "Retry",
  className,
  classNames,
}: NetworkStatusProps) {
  const status = useNetworkStatus()
  const label = status.online ? onlineLabel : offlineLabel

  if (variant === "banner") {
    if (status.online) return null
    return (
      <div
        role="status"
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground motion-safe:animate-in motion-safe:fade-in-0",
          className,
          classNames?.banner,
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-destructive" />
          {offlineLabel}
        </span>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw data-icon="inline-start" className="motion-reduce:animate-none" />
            {retryLabel}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div role="status" className={cn("inline-flex flex-wrap items-center gap-2", className, classNames?.root)}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-foreground">
        <span aria-hidden="true" className={cn("size-2 rounded-full", status.online ? "bg-primary" : "bg-destructive", classNames?.dot)} />
        {label}
      </span>
      {offlineReady ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
          <Check aria-hidden="true" className="size-3" />
          {readyLabel}
        </span>
      ) : null}
    </div>
  )
}
