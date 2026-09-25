"use client"

import Link from "next/link"
import { useMemo, useState, type ComponentType, type ReactNode } from "react"

import { previewMap } from "@/lib/generated/preview-map"
import {
  filterCatalog,
  type CatalogItem,
  type CatalogKind,
} from "@/lib/catalog"
import { cn } from "@/lib/utils"

const kinds: { id: "all" | CatalogKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "component", label: "Component" },
  { id: "block", label: "Block" },
  { id: "hook", label: "Hook" },
  { id: "lib", label: "Lib" },
]

const kindLabel: Record<CatalogKind, string> = {
  component: "Component",
  block: "Block",
  hook: "Hook",
  lib: "Lib",
}

function parseKind(value: string): "all" | CatalogKind {
  return kinds.some((kind) => kind.id === value) ? (value as "all" | CatalogKind) : "all"
}

export function CatalogBrowser({
  items,
  categories,
  initialQuery = "",
  initialKind = "all",
  initialCategory = "all",
  renderPreview,
}: {
  items: CatalogItem[]
  categories: string[]
  initialQuery?: string
  initialKind?: string
  initialCategory?: string
  renderPreview?: (name: string) => ReactNode
}) {
  const [query, setQuery] = useState(initialQuery)
  const [kind, setKind] = useState<"all" | CatalogKind>(parseKind(initialKind))
  const [category, setCategory] = useState(
    initialCategory === "all" || categories.includes(initialCategory) ? initialCategory : "all",
  )

  const results = useMemo(
    () => filterCatalog(items, { query, kind, category }),
    [category, items, kind, query],
  )

  function commit(next: { query: string; kind: "all" | CatalogKind; category: string }) {
    const params = new URLSearchParams()
    if (next.query.trim()) params.set("q", next.query.trim())
    if (next.kind !== "all") params.set("type", next.kind)
    if (next.category !== "all") params.set("category", next.category)
    const search = params.toString()
    window.history.replaceState(null, "", search ? `/?${search}` : "/")
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Catalog</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Components, blocks, and hooks for Eduardo&apos;s projects. Each item inherits the host
          shadcn theme. Descriptions are in Spanish.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Search</span>
          <input
            value={query}
            onChange={(event) => {
              const next = event.target.value
              setQuery(next)
              commit({ query: next, kind, category })
            }}
            placeholder="Name, description, or category"
            aria-label="Search items"
            className="h-10 rounded-lg border border-border bg-background px-3 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Type">
            {kinds.map((option) => (
              <FilterChip
                key={option.id}
                pressed={kind === option.id}
                onClick={() => {
                  setKind(option.id)
                  commit({ query, kind: option.id, category })
                }}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
            <FilterChip
              pressed={category === "all"}
              onClick={() => {
                setCategory("all")
                commit({ query, kind, category: "all" })
              }}
            >
              All categories
            </FilterChip>
            {categories.map((option) => (
              <FilterChip
                key={option}
                pressed={category === option}
                onClick={() => {
                  setCategory(option)
                  commit({ query, kind, category: option })
                }}
              >
                {option}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "item" : "items"}
      </p>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
          No items match this search.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => (
            <li key={item.name} className="[content-visibility:auto]">
              <article
                data-name={item.name}
                data-kind={item.kind}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <div className="h-44 border-b border-border bg-muted/30">
                  {renderPreview ? (
                    renderPreview(item.name)
                  ) : (
                    <Preview name={item.name} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">
                        <Link href={`/items/${item.name}`} className="hover:underline">
                          {item.titleEs}
                        </Link>
                      </h2>
                      <p className="truncate font-mono text-xs text-muted-foreground">{item.name}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {kindLabel[item.kind]}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{item.descriptionEs}</p>
                  <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Categories">
                    {item.categories.map((tag) => (
                      <li key={tag}>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory(tag)
                            commit({ query, kind, category: tag })
                          }}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {tag}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Preview({ name }: { name: string }) {
  const Component = (previewMap as Record<string, ComponentType>)[name]
  if (!Component) return null
  return (
    <div className="h-full">
      <Component />
    </div>
  )
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full border border-border px-3 py-1 text-sm active:scale-[0.96]",
        pressed
          ? "border-foreground bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
