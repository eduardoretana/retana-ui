"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { ChevronLeft, MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { joinMeta } from "@/registry/retana/lib/dashboard-format"
import { PriorityBadge, type PriorityLevel } from "@/registry/retana/ui/priority-badge"

export type RecordCrumb = { label: string; href?: string; onSelect?: () => void }

export type RecordPerson = { name: string; src?: string }

export type RecordAction = { id: string; label: string; onSelect: () => void }

export type RecordHeaderClassNames = {
  root?: string
  title?: string
  meta?: string
  actions?: string
}

export type RecordHeaderProps = {
  crumbs?: readonly RecordCrumb[]
  title: string
  headingLevel?: 1 | 2 | 3
  status?: string
  meta?: readonly string[]
  people?: readonly RecordPerson[]
  priority?: PriorityLevel
  priorityLabel?: string
  statusDot?: string
  statusTone?: "neutral" | "accent" | "info" | "warning"
  onBack?: () => void
  backLabel?: string
  leading?: React.ReactNode
  primary?: React.ReactNode
  secondary?: readonly RecordAction[]
  menu?: readonly RecordAction[]
  collapseActions?: boolean
  aside?: React.ReactNode
  className?: string
  classNames?: RecordHeaderClassNames
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function CrumbLink({ crumb }: { crumb: RecordCrumb }) {
  if (crumb.href) {
    return (
      <BreadcrumbLink
        href={crumb.href}
        onClick={(event) => {
          if (!crumb.onSelect) return
          event.preventDefault()
          crumb.onSelect()
        }}
      >
        {crumb.label}
      </BreadcrumbLink>
    )
  }
  return (
    <button type="button" className="hover:text-foreground" onClick={crumb.onSelect}>
      {crumb.label}
    </button>
  )
}

export function RecordHeader({
  crumbs = [],
  title,
  headingLevel = 1,
  status,
  meta = [],
  people = [],
  priority,
  priorityLabel,
  statusDot,
  statusTone = "info",
  onBack,
  backLabel = "Back",
  leading,
  primary,
  secondary = [],
  menu = [],
  collapseActions = true,
  aside,
  className,
  classNames,
}: RecordHeaderProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      setNarrow((entries[0]?.contentRect.width ?? 0) < 400)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3"
  const middle = crumbs.length > 2 ? crumbs.slice(1, -1) : []
  const foldSecondary = collapseActions && narrow
  const menuActions = [...menu, ...(foldSecondary ? secondary : [])]
  return (
    <header ref={rootRef} data-slot="record-header" className={cn("@container min-w-0", className, classNames?.root)}>
      {crumbs.length ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {crumbs[0]?.href || crumbs[0]?.onSelect ? <CrumbLink crumb={crumbs[0]} /> : <span>{crumbs[0]?.label}</span>}
            </BreadcrumbItem>
            {middle.length ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="@max-[30rem]:hidden">
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {middle.map((crumb) => (
                      <span key={crumb.label} className="inline-flex items-center gap-1.5">
                        <CrumbLink crumb={crumb} />
                        <span aria-hidden>/</span>
                      </span>
                    ))}
                  </span>
                </BreadcrumbItem>
                <BreadcrumbItem className="hidden @max-[30rem]:inline-flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label="More breadcrumbs">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {middle.map((crumb) => (
                        <DropdownMenuItem key={crumb.label} onSelect={() => crumb.onSelect?.()}>
                          {crumb.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            ) : null}
            {crumbs.length > 1 ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="break-words">{crumbs[crumbs.length - 1]?.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : null}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        {onBack ? (
          <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label={backLabel} onClick={onBack}>
            <ChevronLeft />
          </Button>
        ) : null}
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Heading className={cn("m-0 text-3xl font-normal tracking-tight break-words", classNames?.title)}>{title}</Heading>
            {status ? (
              <span
                data-tone={statusTone}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs",
                  statusTone === "accent" && "bg-primary/15",
                  statusTone === "warning" && "bg-chart-4/15",
                  statusTone === "neutral" && "bg-muted",
                  statusTone === "info" && "bg-chart-2/20",
                )}
              >
                {statusTone === "info" ? <span aria-hidden className="size-1.5 rounded-full bg-chart-2" /> : null}
                {status}
              </span>
            ) : null}
          </div>
          {meta.length ? <p className={cn("mt-1 text-sm text-muted-foreground break-words", classNames?.meta)}>{joinMeta([...meta])}</p> : null}
          {people.length || priority || statusDot ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {people.length ? (
                <span className="inline-flex items-center">
                  {people.map((person, index) => (
                    <Avatar key={person.name} size="sm" className={cn(index > 0 && "-ms-2 ring-2 ring-background")}>
                      {person.src ? <AvatarImage src={person.src} alt="" /> : null}
                      <AvatarFallback>{initials(person.name)}</AvatarFallback>
                    </Avatar>
                  ))}
                  <span className="ms-2 text-xs text-muted-foreground">{people.map((person) => person.name).join(", ")}</span>
                </span>
              ) : null}
              {priority ? <PriorityBadge level={priority} label={priorityLabel} /> : null}
              {statusDot ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-chart-2" aria-hidden />
                  {statusDot}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={cn("flex flex-wrap items-center gap-2", classNames?.actions)}>
          {aside}
          {menuActions.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuActions.map((action) => (
                  <DropdownMenuItem key={action.id} onSelect={() => action.onSelect()}>
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {foldSecondary ? null : (
            <div className="flex flex-wrap gap-2">
              {secondary.map((action) => (
                <Button key={action.id} type="button" variant="secondary" className="rounded-full bg-muted" onClick={action.onSelect}>
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          {primary}
        </div>
      </div>
    </header>
  )
}
