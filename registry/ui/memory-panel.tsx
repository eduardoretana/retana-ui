"use client"

/**
 * What the assistant keeps across chats. Clean-room reading of a public
 * behavior description: memories sit in groups, a switch turns them off
 * without deleting them, and each one can be edited, paused, or forgotten.
 * No Affect source, sample data, icons, or assets were copied. The host owns
 * the undo clock.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type MemoryEntry<TMeta = unknown> = {
  id: string
  text: string
  category: string
  source?: string
  date?: string
  paused?: boolean
  meta?: TMeta
}

export type MemoryUndo = {
  text: string
}

export type MemoryPanelLabels = {
  title: string
  count: (count: number) => string
  use: string
  off: string
  all: string
  paused: string
  pause: string
  pauseNamed: (text: string) => string
  resume: string
  resumeNamed: (text: string) => string
  edit: string
  editNamed: (text: string) => string
  save: string
  cancel: string
  forget: string
  forgetNamed: (text: string) => string
  forgot: (text: string) => string
  restore: string
  add: string
  addNamed: string
  added: (text: string) => string
  empty: string
  emptyGroup: string
  loading: string
  saved: (text: string) => string
}

export type MemoryPanelClassNames = {
  root?: string
  entry?: string
}

export type MemoryPanelProps<TMeta = unknown> = {
  memories?: readonly MemoryEntry<TMeta>[]
  enabled?: boolean
  categories?: readonly string[]
  undo?: MemoryUndo | null
  loading?: boolean
  error?: string
  title?: string
  onEnabledChange?: (enabled: boolean) => void
  onEdit?: (id: string, text: string) => void
  onPause?: (id: string, paused: boolean) => void
  onForget?: (id: string) => void
  onRestore?: () => void
  onAdd?: (text: string, category: string) => void
  className?: string
  classNames?: MemoryPanelClassNames
  labels?: Partial<MemoryPanelLabels>
}

const memoryLabels: MemoryPanelLabels = {
  title: "Memory",
  count: (count) => (count === 1 ? "1 memory" : `${count} memories`),
  use: "Use memory",
  off: "New chats will not use these memories. Nothing here is deleted.",
  all: "All",
  paused: "Paused",
  pause: "Pause",
  pauseNamed: (text) => `Pause “${text}”`,
  resume: "Resume",
  resumeNamed: (text) => `Resume “${text}”`,
  edit: "Edit",
  editNamed: (text) => `Edit “${text}”`,
  save: "Save",
  cancel: "Cancel",
  forget: "Forget",
  forgetNamed: (text) => `Forget “${text}”`,
  forgot: (text) => `Forgot “${text}”`,
  restore: "Undo",
  add: "New memory",
  addNamed: "Memory text",
  added: (text) => `Added “${text}”`,
  empty: "Nothing is remembered yet.",
  emptyGroup: "No memories in this group.",
  loading: "Loading memories",
  saved: (text) => `Saved “${text}”`,
}

function resolveLabels(partial?: Partial<MemoryPanelLabels>): MemoryPanelLabels {
  return { ...memoryLabels, ...partial }
}

export function memoryCount(memories: readonly Pick<MemoryEntry, "id" | "paused">[]) {
  return {
    total: memories.length,
    paused: memories.filter((memory) => memory.paused).length,
    active: memories.filter((memory) => !memory.paused).length,
  }
}

export function MemoryPanel<TMeta = unknown>({
  memories = [],
  enabled = true,
  categories,
  undo,
  loading = false,
  error,
  title,
  onEnabledChange,
  onEdit,
  onPause,
  onForget,
  onRestore,
  onAdd,
  className,
  classNames,
  labels: labelOverrides,
}: MemoryPanelProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const groups = categories ?? [...new Set(memories.map((memory) => memory.category))]
  const [filter, setFilter] = React.useState("all")
  const [editing, setEditing] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const [nextText, setNextText] = React.useState("")
  const [nextGroup, setNextGroup] = React.useState(groups[0] ?? "")
  const [live, setLive] = React.useState("")
  const visible = memories.filter((memory) => filter === "all" || memory.category === filter)
  const shownGroups = groups.filter((group) => filter === "all" || filter === group)

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        <Badge variant="secondary">{labels.count(memories.length)}</Badge>
        <label className="ms-auto inline-flex items-center gap-2 text-xs">
          <Switch checked={enabled} onCheckedChange={(value) => onEnabledChange?.(value)} />
          {labels.use}
        </label>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        </div>
      ) : error && memories.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {!enabled ? <p className="text-xs text-muted-foreground">{labels.off}</p> : null}
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          {memories.length === 0 && !undo ? <p className="text-muted-foreground">{labels.empty}</p> : null}
          {groups.length > 0 ? (
            <div role="radiogroup" aria-label={heading} className="flex flex-wrap gap-1">
              {["all", ...groups].map((group) => (
                <button
                  key={group}
                  type="button"
                  role="radio"
                  aria-checked={filter === group}
                  className={cn(
                    "rounded-md border border-border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    filter === group && "border-primary",
                  )}
                  onClick={() => setFilter(group)}
                >
                  {group === "all" ? labels.all : group}
                </button>
              ))}
            </div>
          ) : null}
          {visible.length === 0 && memories.length > 0 ? <p className="text-xs text-muted-foreground">{labels.emptyGroup}</p> : null}
          {shownGroups.map((group) => {
            const rows = visible.filter((memory) => memory.category === group)
            if (rows.length === 0) return null
            return (
              <section key={group} aria-label={group} className="flex flex-col gap-2">
                <h3 className="text-xs font-medium text-muted-foreground">{group}</h3>
                <ul className="flex flex-col gap-2">
                  {rows.map((memory) => {
                    const open = editing === memory.id
                    return (
                      <li key={memory.id} className={cn("rounded-lg border border-border px-3 py-2", memory.paused && "border-dashed", classNames?.entry)}>
                        {open ? (
                          <form
                            className="flex flex-wrap gap-2"
                            onSubmit={(event) => {
                              event.preventDefault()
                              const text = draft.trim()
                              if (!text) return
                              onEdit?.(memory.id, text)
                              setLive(labels.saved(text))
                              setEditing(null)
                            }}
                          >
                            <Input aria-label={labels.editNamed(memory.text)} value={draft} onChange={(event) => setDraft(event.target.value)} className="h-8 min-w-48 flex-1" />
                            <Button type="submit" size="sm">
                              {labels.save}
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>
                              {labels.cancel}
                            </Button>
                          </form>
                        ) : (
                          <p>{memory.text}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[memory.source, memory.date].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {memory.paused ? <Badge variant="outline">{labels.paused}</Badge> : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={labels.editNamed(memory.text)}
                            onClick={() => {
                              setEditing(memory.id)
                              setDraft(memory.text)
                            }}
                          >
                            {labels.edit}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={memory.paused ? labels.resumeNamed(memory.text) : labels.pauseNamed(memory.text)}
                            onClick={() => onPause?.(memory.id, !memory.paused)}
                          >
                            {memory.paused ? labels.resume : labels.pause}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={labels.forgetNamed(memory.text)}
                            onClick={() => {
                              onForget?.(memory.id)
                              setLive(labels.forgot(memory.text))
                            }}
                          >
                            {labels.forget}
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
          {undo ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2">
              <p className="text-xs">{labels.forgot(undo.text)}</p>
              <Button type="button" size="sm" variant="outline" className="ms-auto" onClick={() => onRestore?.()}>
                {labels.restore}
              </Button>
            </div>
          ) : null}
          {adding ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                const text = nextText.trim()
                if (!text || !nextGroup) return
                onAdd?.(text, nextGroup)
                setLive(labels.added(text))
                setNextText("")
                setAdding(false)
              }}
            >
              <Input aria-label={labels.addNamed} value={nextText} onChange={(event) => setNextText(event.target.value)} className="h-8" />
              <div role="radiogroup" aria-label={labels.add} className="flex flex-wrap gap-1">
                {groups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    role="radio"
                    aria-checked={nextGroup === group}
                    className={cn("rounded-md border border-border px-2 py-1 text-xs", nextGroup === group && "border-primary")}
                    onClick={() => setNextGroup(group)}
                  >
                    {group}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  {labels.save}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setAdding(false)}>
                  {labels.cancel}
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => setAdding(true)}>
              {labels.add}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
