"use client"

/**
 * Clean-room company table. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, or assets were copied.
 * crm-table is the fixed contact layout. This one is the company book.
 */

import * as React from "react"
import { ChevronDown, ChevronUp, Download } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { downloadCsv, toCsv } from "@/registry/retana/lib/csv"
import {
  crmInitials,
  paginate,
  sortCompanies,
  type CrmCompany,
  type CrmCsvLabels,
  type CrmSort,
  type CrmSortKey,
  type CrmStatusTone,
} from "@/registry/retana/lib/crm-companies"
import { Sparkline } from "@/registry/retana/ui/sparkline"

export type CrmCompaniesTableLabels = {
  caption?: string
  name?: string
  status?: string
  owner?: string
  pipeline?: string
  score?: string
  activity?: string
  selectAll?: string
  selectRow?: (company: CrmCompany) => string
  openRow?: (company: CrmCompany) => string
  empty?: string
  loading?: string
  selected?: (count: number) => string
  range?: (start: number, end: number, total: number) => string
  previous?: string
  next?: string
  page?: (page: number, pages: number) => string
  export?: string
  sort?: (label: string) => string
}

export type CrmCompaniesTableProps = {
  rows: readonly CrmCompany[]
  sort?: CrmSort
  defaultSort?: CrmSort
  onSortChange?: (sort: CrmSort) => void
  selectedIds?: string[]
  defaultSelectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  page?: number
  defaultPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onRowOpen?: (company: CrmCompany) => void
  onExport?: (rows: readonly CrmCompany[]) => void
  formatValue?: (value: number) => string
  csvLabels?: Partial<CrmCsvLabels>
  exportFilename?: string
  loading?: boolean
  labels?: CrmCompaniesTableLabels
  className?: string
}

const TONE_VARIANT: Record<CrmStatusTone, "default" | "secondary" | "outline" | "destructive"> = {
  emphasis: "default",
  neutral: "secondary",
  muted: "outline",
  danger: "destructive",
}

const COLUMNS: { key: CrmSortKey; label: keyof CrmCompaniesTableLabels }[] = [
  { key: "name", label: "name" },
  { key: "status", label: "status" },
  { key: "owner", label: "owner" },
  { key: "pipeline", label: "pipeline" },
  { key: "score", label: "score" },
  { key: "activity", label: "activity" },
]

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const set = React.useCallback(
    (next: T) => {
      if (value === undefined) setInternal(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [current, set] as const
}

export function CrmCompaniesTable({
  rows,
  sort: sortProp,
  defaultSort = { key: "name", direction: "asc" },
  onSortChange,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  page: pageProp,
  defaultPage = 0,
  pageSize = 8,
  onPageChange,
  onRowOpen,
  onExport,
  formatValue = (value) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value),
  csvLabels,
  exportFilename = "companies.csv",
  loading = false,
  labels,
  className,
}: CrmCompaniesTableProps) {
  const copy = {
    caption: labels?.caption ?? "Companies",
    name: labels?.name ?? "Name",
    status: labels?.status ?? "Status",
    owner: labels?.owner ?? "Owner",
    pipeline: labels?.pipeline ?? "Pipeline",
    score: labels?.score ?? "Score",
    activity: labels?.activity ?? "Activity",
    selectAll: labels?.selectAll ?? "Select all on this page",
    empty: labels?.empty ?? "No companies",
    loading: labels?.loading ?? "Loading companies",
    previous: labels?.previous ?? "Previous page",
    next: labels?.next ?? "Next page",
    export: labels?.export ?? "Export CSV",
  }
  const columnLabel: Record<CrmSortKey, string> = {
    name: copy.name,
    status: copy.status,
    owner: copy.owner,
    pipeline: copy.pipeline,
    score: copy.score,
    activity: copy.activity,
  }
  const [sort, setSort] = useControllable(sortProp, defaultSort, onSortChange)
  const [selectedIds, setSelectedIds] = useControllable(selectedProp, [...defaultSelectedIds], onSelectedIdsChange)
  const [page, setPage] = useControllable(pageProp, defaultPage, onPageChange)
  const sorted = React.useMemo(() => sortCompanies(rows, sort), [rows, sort])
  const paged = paginate(sorted, page, pageSize)
  const pageIds = paged.rows.map((company) => company.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.includes(id))
  const allSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length
  const someSelected = selectedOnPage.length > 0 && !allSelected

  function toggleSort(key: CrmSortKey) {
    setSort(sort.key === key ? { key, direction: sort.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" })
  }

  function togglePage(checked: boolean) {
    if (checked) setSelectedIds([...new Set([...selectedIds, ...pageIds])])
    else setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)))
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id))
  }

  function exportRows() {
    const chosen = selectedIds.length > 0 ? sorted.filter((company) => selectedIds.includes(company.id)) : sorted
    if (onExport) onExport(chosen)
    else downloadCsv(exportFilename, companiesToCsv(chosen, csvLabels, formatValue))
  }

  const range =
    paged.total === 0
      ? labels?.range?.(0, 0, 0) ?? "0 companies"
      : labels?.range?.(paged.start + 1, paged.end, paged.total) ?? `${paged.start + 1}–${paged.end} of ${paged.total}`

  return (
    <div data-slot="crm-companies-table" className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="max-h-[28rem] min-w-0 contain-paint overflow-auto rounded-xl border border-border">
        <table data-slot="table" className="w-full min-w-[44rem] caption-bottom text-sm" aria-busy={loading || undefined}>
          <caption className="sr-only">{copy.caption}</caption>
          <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
            <TableRow>
              <TableHead className="sticky start-0 z-30 w-10 bg-background">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => togglePage(checked === true)}
                  disabled={loading || pageIds.length === 0}
                  aria-label={copy.selectAll}
                />
              </TableHead>
              {COLUMNS.map((column) => {
                const active = sort.key === column.key
                const label = columnLabel[column.key]
                return (
                  <TableHead
                    key={column.key}
                    aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                    className={cn("sticky top-0 bg-background", column.key === "name" && "start-10 z-30")}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md text-start focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      onClick={() => toggleSort(column.key)}
                    >
                      {label}
                      <span className="sr-only">{labels?.sort?.(label) ?? `, sort by ${label}`}</span>
                      {active ? (
                        sort.direction === "asc" ? (
                          <ChevronUp aria-hidden="true" />
                        ) : (
                          <ChevronDown aria-hidden="true" />
                        )
                      ) : null}
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {copy.loading}
                </TableCell>
              </TableRow>
            ) : paged.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {copy.empty}
                </TableCell>
              </TableRow>
            ) : (
              paged.rows.map((company) => {
                const selected = selectedIds.includes(company.id)
                return (
                  <TableRow key={company.id} data-state={selected ? "selected" : undefined}>
                    <TableCell className="sticky start-0 z-10 bg-background">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => toggleRow(company.id, checked === true)}
                        aria-label={labels?.selectRow?.(company) ?? `Select ${company.name}`}
                      />
                    </TableCell>
                    <TableCell className="sticky start-10 z-10 max-w-56 bg-background">
                      <button
                        type="button"
                        className="flex min-w-0 items-center gap-2 rounded-md text-start focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        onClick={() => onRowOpen?.(company)}
                      >
                        <Avatar size="sm">
                          {company.logoUrl ? <AvatarImage src={company.logoUrl} alt="" /> : null}
                          <AvatarFallback>{crmInitials(company.name)}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate font-medium">{company.name}</span>
                        <span className="sr-only">{labels?.openRow?.(company) ?? `, open ${company.name}`}</span>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={TONE_VARIANT[company.statusTone ?? "neutral"]}>{company.statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="max-w-40 truncate">{company.owner}</TableCell>
                    <TableCell className="text-end tabular-nums">{formatValue(company.pipelineValue)}</TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-2"
                        role="meter"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.max(0, Math.min(100, company.score))}
                        aria-label={copy.score}
                      >
                        <span className="w-8 shrink-0 text-end tabular-nums">{company.score}</span>
                        <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <span
                            className="absolute inset-y-0 start-0 bg-primary"
                            style={{ width: `${Math.max(0, Math.min(100, company.score))}%` }}
                          />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-36">
                      {company.activity.length > 1 ? (
                        <Sparkline
                          data={[...company.activity]}
                          label={company.activityLabel}
                          interactive={false}
                          width={112}
                          height={28}
                          className="w-28"
                          classNames={{ root: "gap-0", caption: "sr-only" }}
                        />
                      ) : (
                        <span className="text-muted-foreground">{company.activityLabel}</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <p className="min-w-0 flex-1" aria-live="polite">
          {selectedIds.length > 0 ? (
            <span className="me-3 text-foreground">{labels?.selected?.(selectedIds.length) ?? `${selectedIds.length} selected`}</span>
          ) : null}
          <span>{range}</span>
          <span className="ms-3">{labels?.page?.(paged.page + 1, paged.pages) ?? `${paged.page + 1} / ${paged.pages}`}</span>
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setPage(paged.page - 1)} disabled={paged.page === 0 || loading}>
          {copy.previous}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPage(paged.page + 1)}
          disabled={paged.page >= paged.pages - 1 || loading}
        >
          {copy.next}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={exportRows} disabled={loading || sorted.length === 0}>
          <Download data-icon="inline-start" aria-hidden="true" />
          {copy.export}
        </Button>
      </div>
    </div>
  )
}

const DEFAULT_CSV_LABELS: CrmCsvLabels = {
  name: "Name",
  status: "Status",
  owner: "Owner",
  pipeline: "Pipeline",
  score: "Score",
  activity: "Activity",
}

export function companiesToCsv(
  rows: readonly CrmCompany[],
  labels: Partial<CrmCsvLabels> = {},
  formatValue: (value: number) => string = (value) => String(value),
) {
  const headers = { ...DEFAULT_CSV_LABELS, ...labels }
  const columns = [
    { key: "name", header: headers.name },
    { key: "status", header: headers.status },
    { key: "owner", header: headers.owner },
    { key: "pipeline", header: headers.pipeline },
    { key: "score", header: headers.score },
    { key: "activity", header: headers.activity },
  ]
  const records = rows.map((company) => ({
    name: company.name,
    status: company.statusLabel,
    owner: company.owner,
    pipeline: formatValue(company.pipelineValue),
    score: company.score,
    activity: company.activityLabel,
  }))
  return toCsv(records, columns)
}
