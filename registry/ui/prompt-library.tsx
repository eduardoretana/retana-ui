"use client"

/**
 * Saved prompts with blanks in the sentence. Clean-room reading of a public
 * behavior description: each blank is a field, the finished sentence assembles
 * underneath, and it can be used only once every blank is filled. No Affect
 * source, sample data, icons, or assets were copied.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type PromptVariable<TMeta = unknown> = {
  name: string
  description?: string
  meta?: TMeta
}

export type PromptTemplate<TMeta = unknown> = {
  id: string
  title: string
  category?: string
  body: string
  variables?: readonly PromptVariable<TMeta>[]
  meta?: TMeta
}

export type PromptPart = { type: "text"; text: string } | { type: "slot"; name: string }

export type PromptLibraryLabels = {
  title: string
  list: string
  search: string
  empty: string
  emptySearch: string
  loading: string
  field: (name: string, description?: string) => string
  progress: (filled: number, total: number) => string
  ready: string
  preview: string
  copy: string
  copied: string
  use: string
  useNamed: (title: string) => string
  used: (title: string) => string
  missing: (count: number) => string
}

export type PromptLibraryClassNames = {
  root?: string
  template?: string
}

export type PromptLibraryProps<TMeta = unknown> = {
  templates?: readonly PromptTemplate<TMeta>[]
  selectedId?: string | null
  values?: Readonly<Record<string, string>>
  loading?: boolean
  error?: string
  title?: string
  onSelect?: (id: string) => void
  onValue?: (name: string, value: string) => void
  onCopy?: (prompt: string) => void
  onUse?: (prompt: string, templateId: string) => void
  className?: string
  classNames?: PromptLibraryClassNames
  labels?: Partial<PromptLibraryLabels>
}

const SLOT = /\{([A-Za-z][A-Za-z0-9_-]*)\}/g

const libraryLabels: PromptLibraryLabels = {
  title: "Prompts",
  list: "Saved prompts",
  search: "Search prompts",
  empty: "No prompts saved yet.",
  emptySearch: "No prompt matches that search.",
  loading: "Loading prompts",
  field: (name, description) => (description ? `${name}. ${description}` : name),
  progress: (filled, total) => `${filled} of ${total} filled`,
  ready: "Ready to use",
  preview: "Preview",
  copy: "Copy",
  copied: "Prompt copied",
  use: "Use prompt",
  useNamed: (title) => `Use “${title}”`,
  used: (title) => `Used “${title}”`,
  missing: (count) => (count === 1 ? "1 blank still open" : `${count} blanks still open`),
}

function resolveLabels(partial?: Partial<PromptLibraryLabels>): PromptLibraryLabels {
  return { ...libraryLabels, ...partial }
}

export function promptParts(body: string): PromptPart[] {
  const parts: PromptPart[] = []
  let last = 0
  for (const match of body.matchAll(SLOT)) {
    const index = match.index ?? 0
    if (index > last) parts.push({ type: "text", text: body.slice(last, index) })
    parts.push({ type: "slot", name: match[1] ?? "" })
    last = index + match[0].length
  }
  if (last < body.length) parts.push({ type: "text", text: body.slice(last) })
  return parts
}

export function promptNames(template: Pick<PromptTemplate, "body" | "variables">) {
  const fromBody = promptParts(template.body).flatMap((part) => (part.type === "slot" ? [part.name] : []))
  const declared = template.variables?.map((variable) => variable.name) ?? []
  return [...new Set([...declared, ...fromBody])]
}

export function promptText(body: string, values: Readonly<Record<string, string>>) {
  return body.replace(SLOT, (_match, name: string) => {
    const value = values[name]?.trim()
    return value ? value : `{${name}}`
  })
}

export function promptMissing(template: Pick<PromptTemplate, "body" | "variables">, values: Readonly<Record<string, string>>) {
  return promptNames(template).filter((name) => !values[name]?.trim())
}

export function PromptLibrary<TMeta = unknown>({
  templates = [],
  selectedId,
  values = {},
  loading = false,
  error,
  title,
  onSelect,
  onValue,
  onCopy,
  onUse,
  className,
  classNames,
  labels: labelOverrides,
}: PromptLibraryProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [query, setQuery] = React.useState("")
  const [live, setLive] = React.useState("")
  const needle = query.trim().toLocaleLowerCase()
  const shown = templates.filter((template) => {
    if (!needle) return true
    return template.title.toLocaleLowerCase().includes(needle) || (template.category ?? "").toLocaleLowerCase().includes(needle)
  })
  const selected = templates.find((template) => template.id === selectedId) ?? shown[0]
  const names = selected ? promptNames(selected) : []
  const descriptions = new Map(selected?.variables?.map((variable) => [variable.name, variable.description]) ?? [])
  const missing = selected ? promptMissing(selected, values) : []
  const filled = names.length - missing.length
  const ready = selected != null && missing.length === 0
  const preview = selected ? promptText(selected.body, values) : ""

  function move(to: "next" | "prev" | "first" | "last") {
    if (shown.length === 0) return
    const index = shown.findIndex((template) => template.id === selected?.id)
    const nextIndex = to === "first" ? 0 : to === "last" ? shown.length - 1 : to === "next" ? Math.min(shown.length - 1, index + 1) : Math.max(0, index - 1)
    const next = shown[nextIndex]
    if (next) onSelect?.(next.id)
  }

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
        {selected && names.length > 0 ? <Badge variant={ready ? "secondary" : "outline"}>{ready ? labels.ready : labels.progress(filled, names.length)}</Badge> : null}
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-8 w-full motion-reduce:animate-none" />
          <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        </div>
      ) : error && templates.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : templates.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <Input
            aria-label={labels.search}
            value={query}
            placeholder={labels.search}
            className="h-8"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("")
              if (event.key === "ArrowDown") {
                event.preventDefault()
                move("next")
              }
            }}
          />
          {shown.length === 0 ? (
            <p className="text-xs text-muted-foreground">{labels.emptySearch}</p>
          ) : (
            <div role="listbox" aria-label={labels.list} className="flex flex-col gap-1">
              {shown.map((template) => {
                const chosen = template.id === selected?.id
                return (
                  <button
                    key={template.id}
                    type="button"
                    role="option"
                    aria-selected={chosen}
                    tabIndex={chosen ? 0 : -1}
                    className={cn(
                      "rounded-md border border-border px-2 py-1.5 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      chosen && "border-primary",
                      classNames?.template,
                    )}
                    onClick={() => onSelect?.(template.id)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault()
                        move("next")
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault()
                        move("prev")
                      }
                      if (event.key === "Home") {
                        event.preventDefault()
                        move("first")
                      }
                      if (event.key === "End") {
                        event.preventDefault()
                        move("last")
                      }
                    }}
                  >
                    <span className="font-medium">{template.title}</span>
                    {template.category ? <span className="mt-0.5 block text-xs text-muted-foreground">{template.category}</span> : null}
                  </button>
                )
              })}
            </div>
          )}
          {selected ? (
            <div className="flex flex-col gap-3">
              <p className="leading-8">
                {promptParts(selected.body).map((part, index) =>
                  part.type === "text" ? (
                    <span key={`${part.text}-${index}`}>{part.text}</span>
                  ) : (
                    <Input
                      key={`${part.name}-${index}`}
                      aria-label={labels.field(part.name, descriptions.get(part.name))}
                      value={values[part.name] ?? ""}
                      placeholder={part.name}
                      autoComplete="off"
                      className="mx-1 inline-block h-8 w-auto min-w-24 max-w-full"
                      style={{ width: `${Math.max((values[part.name] || part.name).length, 8) + 3}ch` }}
                      onChange={(event) => onValue?.(part.name, event.target.value)}
                    />
                  ),
                )}
              </p>
              {names.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {names.map((name) =>
                    descriptions.get(name) ? (
                      <li key={name} className="text-xs text-muted-foreground">
                        {name}: {descriptions.get(name)}
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : null}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground">{labels.preview}</h3>
                <p className="mt-1">{preview}</p>
              </div>
              <p className="text-xs text-muted-foreground">{ready ? labels.ready : labels.missing(missing.length)}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onCopy?.(preview)
                    setLive(labels.copied)
                  }}
                >
                  {labels.copy}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!ready}
                  aria-label={labels.useNamed(selected.title)}
                  onClick={() => {
                    if (!ready) return
                    onUse?.(preview, selected.id)
                    setLive(labels.used(selected.title))
                  }}
                >
                  {labels.use}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
