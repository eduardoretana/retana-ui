"use client"

import * as React from "react"
import {
  Building2,
  Calendar,
  Check,
  DollarSign,
  Flag,
  CircleDot,
  Hash,
  ImageIcon,
  Link,
  ListChecks,
  Tag,
  Type,
  UserRound,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  asPerson,
  formatFieldValue,
  isEmptyValue,
  optionTone,
  type ChartTone,
  type FieldDef,
  type FieldIconName,
  type MultiRecord,
} from "@/registry/retana/lib/multi-view"

const ICONS: Record<FieldIconName, React.ComponentType<{ className?: string }>> = {
  text: Type,
  hash: Hash,
  currency: DollarSign,
  calendar: Calendar,
  user: UserRound,
  link: Link,
  image: ImageIcon,
  check: Check,
  status: ListChecks,
  flag: Flag,
  building: Building2,
  progress: CircleDot,
  tag: Tag,
}

const TONE_CLASS: Record<ChartTone, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
}

export function toneClass(tone: ChartTone): string {
  return TONE_CLASS[tone]
}

export function FieldIcon({
  name,
  className,
}: {
  name?: FieldIconName
  className?: string
}) {
  if (!name) return null
  const Icon = ICONS[name]
  return <Icon className={className} aria-hidden />
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

export function PersonFace({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <Avatar size="sm" className={className}>
      <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

export function StatusPill({
  field,
  value,
  className,
}: {
  field: FieldDef
  value: unknown
  className?: string
}) {
  if (isEmptyValue(value)) return <span className="text-muted-foreground">—</span>
  const text = formatFieldValue(value, field)
  const index = field.options?.findIndex((option) => option.value === String(value)) ?? 0
  const tone = optionTone(field, String(value), Math.max(0, index))
  return (
    <Badge variant="outline" className={cn("max-w-full", className)}>
      <span className={cn("size-1.5 rounded-full", toneClass(tone))} aria-hidden />
      <span className="truncate">{text}</span>
    </Badge>
  )
}

export function FieldDisplay({
  field,
  value,
  locale,
  className,
}: {
  field: FieldDef
  value: unknown
  locale?: string
  className?: string
}) {
  if (isEmptyValue(value)) {
    return <span className={cn("text-muted-foreground", className)}>—</span>
  }
  if (field.type === "status" || field.type === "select") {
    return <StatusPill field={field} value={value} className={className} />
  }
  if (field.type === "person" || field.type === "relation") {
    const person = asPerson(value)
    if (!person) return <span className="text-muted-foreground">—</span>
    return (
      <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
        <PersonFace name={person.name} />
        <span className="truncate">{person.name}</span>
      </span>
    )
  }
  if (field.type === "progress") {
    const n = typeof value === "number" ? value : Number(value)
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <ProgressRing value={Number.isFinite(n) ? n : 0} />
        <span>{formatFieldValue(value, field, locale)}</span>
      </span>
    )
  }
  const text = formatFieldValue(value, field, locale)
  if (field.type === "url" && typeof value === "string") {
    return (
      <a
        href={value}
        className={cn("truncate underline-offset-2 hover:underline", className)}
        dir="auto"
      >
        {text}
      </a>
    )
  }
  return (
    <span className={cn("truncate", className)} dir="auto">
      {text}
    </span>
  )
}

export function ProgressRing({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4 shrink-0", className)} aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" className="stroke-muted" strokeWidth="2" />
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={`${pct} ${100 - pct}`}
        pathLength={100}
        transform="rotate(-90 8 8)"
      />
    </svg>
  )
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])
  return reduced
}

export function useContainerWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => setWidth(node.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

export function displayFields(
  fields: readonly FieldDef[],
  ids: readonly string[] | undefined,
  skip: ReadonlySet<string>,
): FieldDef[] {
  const source = ids?.length
    ? ids.map((id) => fields.find((field) => field.id === id)).filter((field): field is FieldDef => Boolean(field))
    : fields
  return source.filter((field) => !skip.has(field.id))
}

export function recordValue(record: MultiRecord, field: FieldDef) {
  return record[field.id]
}
