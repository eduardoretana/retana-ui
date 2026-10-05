"use client"

/**
 * Clean-room company toolbar. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, or assets were copied.
 * filter-toolbar is the single-value chip bar. This one is multi-select facets.
 */

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { facetSelectionCount, toggleFacetValue, type CrmFacetSelection } from "@/registry/retana/lib/crm-companies"
import { SearchField } from "@/registry/retana/ui/search-field"
import { SegmentedControl, type Segment } from "@/registry/retana/ui/segmented-control"

export type CrmToolbarFacet = {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
}

export type CrmToolbarLabels = {
  search?: string
  searchPlaceholder?: string
  segments?: string
  filters?: string
  filterMenu?: string
  openFilters?: string
  filterDescription?: string
  clear?: string
  emptyFacets?: string
}

export type CrmToolbarProps = {
  query: string
  onQueryChange: (query: string) => void
  segment: string
  onSegmentChange: (segment: string) => void
  segments?: readonly Segment[]
  facets?: readonly CrmToolbarFacet[]
  selection?: CrmFacetSelection
  onSelectionChange?: (selection: CrmFacetSelection) => void
  /** auto measures the toolbar. menu and sheet force a layout, including tests. */
  layout?: "auto" | "menu" | "sheet"
  labels?: CrmToolbarLabels
  className?: string
}

const DEFAULT_SEGMENTS: Segment[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "lead", label: "Lead" },
  { value: "churned", label: "Churned" },
]

function FacetChoices({
  facets,
  selection,
  onToggle,
}: {
  facets: readonly CrmToolbarFacet[]
  selection: CrmFacetSelection
  onToggle: (facetId: string, value: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {facets.map((facet) => (
        <fieldset key={facet.id} className="flex min-w-0 flex-col gap-2">
          <legend className="text-sm font-medium">{facet.label}</legend>
          {facet.options.map((option) => {
            const checked = (selection[facet.id] ?? []).includes(option.value)
            const id = `${facet.id}-${option.value}`
            return (
              <label key={option.value} htmlFor={id} className="flex min-w-0 items-center gap-2 text-sm">
                <Checkbox id={id} checked={checked} onCheckedChange={() => onToggle(facet.id, option.value)} />
                <span className="min-w-0 truncate">{option.label}</span>
              </label>
            )
          })}
        </fieldset>
      ))}
    </div>
  )
}

export function CrmToolbar({
  query,
  onQueryChange,
  segment,
  onSegmentChange,
  segments = DEFAULT_SEGMENTS,
  facets = [],
  selection = {},
  onSelectionChange,
  layout = "auto",
  labels,
  className,
}: CrmToolbarProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [measuredSheet, setMeasuredSheet] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const copy = {
    search: labels?.search ?? "Search companies",
    searchPlaceholder: labels?.searchPlaceholder ?? "Search companies",
    segments: labels?.segments ?? "Segments",
    filters: labels?.filters ?? "Filters",
    filterMenu: labels?.filterMenu ?? "Filter menu",
    openFilters: labels?.openFilters ?? "Open filters",
    filterDescription: labels?.filterDescription ?? "Choose any values. A company must match every facet you set.",
    clear: labels?.clear ?? "Clear filters",
    emptyFacets: labels?.emptyFacets ?? "No filters",
  }
  const count = facetSelectionCount(selection)
  const sheet = layout === "sheet" || (layout === "auto" && measuredSheet)

  React.useLayoutEffect(() => {
    if (layout !== "auto") return
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const update = (width: number) => {
      if (width > 0) setMeasuredSheet(width < 640)
    }
    update(node.getBoundingClientRect().width)
    const observer = new ResizeObserver(([entry]) => update(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [layout])

  function toggle(facetId: string, value: string) {
    onSelectionChange?.(toggleFacetValue(selection, facetId, value))
  }

  function clear() {
    onSelectionChange?.({})
  }

  const filterButton = (
    <>
      <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
      {copy.filters}
      {count > 0 ? <Badge variant="secondary">{count}</Badge> : null}
    </>
  )

  return (
    <div ref={rootRef} data-slot="crm-toolbar" className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <SearchField
          label={copy.search}
          placeholder={copy.searchPlaceholder}
          value={query}
          onValueChange={onQueryChange}
          className="min-w-0 flex-1 basis-48"
          classNames={{ label: "sr-only" }}
        />
        {facets.length > 0 && !sheet ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" aria-label={copy.filterMenu}>
                {filterButton}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
              {facets.map((facet, index) => (
                <DropdownMenuGroup key={facet.id}>
                  {index > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel>{facet.label}</DropdownMenuLabel>
                  {facet.options.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={(selection[facet.id] ?? []).includes(option.value)}
                      onCheckedChange={() => toggle(facet.id, option.value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              ))}
              {count > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={clear}>{copy.clear}</DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {facets.length > 0 && sheet ? (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" aria-label={copy.openFilters}>
                {filterButton}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>{copy.filters}</SheetTitle>
                <SheetDescription>{copy.filterDescription}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4">
                {facets.some((facet) => facet.options.length > 0) ? (
                  <FacetChoices facets={facets} selection={selection} onToggle={toggle} />
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.emptyFacets}</p>
                )}
              </div>
              <SheetFooter>
                <Button type="button" variant="outline" onClick={clear} disabled={count === 0}>
                  {copy.clear}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
      <div className="min-w-0 overflow-hidden">
        <SegmentedControl label={copy.segments} options={[...segments]} value={segment} onValueChange={onSegmentChange} />
      </div>
    </div>
  )
}
