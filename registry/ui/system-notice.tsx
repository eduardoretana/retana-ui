"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/system-notice-banner/system-notice-banner.tsx

import * as React from "react"
import { Info, TriangleAlert, Wifi, WifiOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SystemNoticeTone = "info" | "warning" | "error"
export type SystemNoticeKind = "info" | "warning" | "offline" | "online" | "switched"

export type SystemNoticeClassNames = {
  root?: string
  text?: string
}

const PRESETS: Record<SystemNoticeKind, { tone: SystemNoticeTone; text: string }> = {
  info: { tone: "info", text: "Update" },
  warning: { tone: "warning", text: "Check this before you continue." },
  offline: { tone: "warning", text: "You are offline. Changes stay on this device." },
  online: { tone: "info", text: "Back online." },
  switched: { tone: "info", text: "Switched." },
}

export type SystemNoticeProps = {
  kind?: SystemNoticeKind
  tone?: SystemNoticeTone
  children?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  onDismiss?: () => void
  messages?: Partial<Record<SystemNoticeKind, string>>
  className?: string
  classNames?: SystemNoticeClassNames
}

export function SystemNotice({
  kind = "info",
  tone,
  children,
  actionLabel,
  onAction,
  onDismiss,
  messages,
  className,
  classNames,
}: SystemNoticeProps) {
  const preset = PRESETS[kind]
  const resolvedTone = tone ?? preset.tone
  const text = children ?? messages?.[kind] ?? preset.text
  const Icon = kind === "offline" ? WifiOff : kind === "online" ? Wifi : resolvedTone === "warning" || resolvedTone === "error" ? TriangleAlert : Info

  return (
    <div
      role={resolvedTone === "error" ? "alert" : "status"}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 rounded-md px-3 py-1.5 text-center text-sm",
        resolvedTone === "info" && "text-muted-foreground",
        resolvedTone === "warning" && "bg-accent text-accent-foreground",
        resolvedTone === "error" && "bg-destructive/10 text-destructive",
        className,
        classNames?.root,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <p className={cn("min-w-0", classNames?.text)}>{text}</p>
      {actionLabel && onAction ? (
        <Button type="button" size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? (
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Dismiss" onClick={onDismiss}>
          <X data-icon="inline-start" />
        </Button>
      ) : null}
    </div>
  )
}
