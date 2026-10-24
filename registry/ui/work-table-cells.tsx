"use client"

/** Reusable work-table cells. Tones come from status-tone via StatusPill. */

import { Flag } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  effortFilled,
  formatCompactNumber,
  formatMinutes,
  formatPercent,
  formatRelativeDue,
  formatSla,
  priorityTone,
  type WorkPriority,
} from "@/registry/retana/lib/work-table"
import { StatusPill, type StatusPillAppearance } from "@/registry/retana/ui/status-pill"
import type { StatusTone } from "@/registry/retana/lib/status-tone"

export type WorkPerson = {
  id: string
  name: string
  initials?: string
  imageUrl?: string | null
}

export function WorkTitleCell({
  title,
  code,
  kind,
  className,
}: {
  title: string
  code?: string
  kind?: string
  className?: string
}) {
  const meta = [code, kind].filter(Boolean).join(" · ")
  return (
    <div className={cn("min-w-0", className)} data-slot="work-title">
      <p className="truncate font-medium text-foreground">{title}</p>
      {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
    </div>
  )
}

export function WorkPersonCell({
  person,
  emptyLabel = "Sin asignar",
  className,
}: {
  person?: WorkPerson | null
  emptyLabel?: string
  className?: string
}) {
  if (!person) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{emptyLabel}</span>
  }
  const initials = person.initials || person.name.slice(0, 2)
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)} data-slot="work-person">
      <Avatar size="sm">
        {person.imageUrl ? <AvatarImage src={person.imageUrl} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{person.name}</span>
    </span>
  )
}

export function WorkPriorityCell({
  priority,
  label,
  className,
}: {
  priority: WorkPriority
  label?: string
  className?: string
}) {
  return (
    <StatusPill
      className={className}
      tone={priorityTone(priority)}
      label={label ?? priority.toUpperCase()}
      dot={false}
      icon={<Flag className="size-3" />}
    />
  )
}

export function WorkDueCell({
  value,
  now = new Date(),
  overdueLabel = "Vencida",
  className,
}: {
  value?: string | null
  now?: Date
  overdueLabel?: string
  className?: string
}) {
  const due = formatRelativeDue(value, now, { overdue: overdueLabel })
  return (
    <span className={cn("text-sm tabular-nums", due.overdue ? "text-destructive" : "text-muted-foreground", className)} data-overdue={due.overdue ? "" : undefined}>
      {due.label}
    </span>
  )
}

export function WorkStatusCell({
  label,
  tone = "neutral",
  appearance = "soft",
  className,
}: {
  label: string
  tone?: StatusTone
  appearance?: Extract<StatusPillAppearance, "soft" | "outline" | "text">
  className?: string
}) {
  return <StatusPill label={label} tone={tone} appearance={appearance} className={className} />
}

export function WorkSlaCell({
  value,
  now = new Date(),
  overdueLabel = "Vencido",
  className,
}: {
  value?: string | null
  now?: Date
  overdueLabel?: string
  className?: string
}) {
  const sla = formatSla(value, now, { overdue: overdueLabel })
  return (
    <span className={cn("text-sm tabular-nums", sla.overdue ? "font-medium text-destructive" : "text-foreground", className)} data-overdue={sla.overdue ? "" : undefined}>
      {sla.label}
    </span>
  )
}

export function WorkEffortCell({
  points,
  segments = 5,
  max = 8,
  className,
}: {
  points: number
  segments?: number
  max?: number
  className?: string
}) {
  const filled = effortFilled(points, segments, max)
  return (
    <span className={cn("inline-flex items-center gap-2", className)} data-slot="work-effort">
      <span className="inline-flex gap-0.5" aria-hidden>
        {Array.from({ length: segments }, (_, index) => (
          <span key={index} className={cn("h-2.5 w-1.5 rounded-sm", index < filled ? "bg-foreground" : "bg-muted")} />
        ))}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">{points} pts</span>
    </span>
  )
}

export function WorkNumberCell({
  value,
  kind = "compact",
  className,
}: {
  value: number
  kind?: "compact" | "percent" | "minutes"
  className?: string
}) {
  const label = kind === "percent" ? formatPercent(value) : kind === "minutes" ? formatMinutes(value) : formatCompactNumber(value)
  return <span className={cn("text-sm tabular-nums", className)}>{label}</span>
}

export function WorkRankCell({ rank, className }: { rank: number; className?: string }) {
  return (
    <span data-slot="work-rank" className={cn("inline-flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-foreground tabular-nums", className)}>
      {rank}
    </span>
  )
}
