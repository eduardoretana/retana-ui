"use client"

import * as React from "react"
import {
  CalendarDays,
  Columns3,
  Download,
  GanttChart,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Table2,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { downloadCsv } from "@/registry/retana/lib/csv"
import {
  draftFromFormData,
  fieldById,
  filterRecords,
  recordTitle,
  recordsToCsv,
  searchRecords,
  sortRecords,
  validateDraft,
  type FieldDef,
  type FilterClause,
  type FilterOp,
  type MultiRecord,
  type SortClause,
  type ViewConfig,
  type ViewKind,
} from "@/registry/retana/lib/multi-view"
import { useMultiView, useOptimisticRecords, type UrlAdapter, type ViewPersistence } from "@/registry/retana/hooks/use-multi-view"
import { EntityForm } from "@/registry/retana/ui/entity-form"
import { LayeredPanel, type LayeredPanelMode } from "@/registry/retana/ui/layered-panel"
import { RecordProperties } from "@/registry/retana/ui/record-properties"
import { ViewCalendar } from "@/registry/retana/ui/view-calendar"
import { ViewGallery } from "@/registry/retana/ui/view-gallery"
import { ViewGroupedList } from "@/registry/retana/ui/view-grouped-list"
import { ViewKanban } from "@/registry/retana/ui/view-kanban"
import { useContainerWidth } from "@/registry/retana/ui/multi-view-fields"
import { ViewTable } from "@/registry/retana/ui/view-table"
import { ViewTimeline } from "@/registry/retana/ui/view-timeline"
import { ViewCustomizer, ViewSwitcher as AnimatedViewSwitcher } from "@/registry/retana/ui/view-customizer"

const VIEW_ICONS: Record<ViewKind, React.ComponentType<{ className?: string }>> = {
  table: Table2,
  kanban: Columns3,
  calendar: CalendarDays,
  timeline: GanttChart,
  "grouped-list": List,
  gallery: LayoutGrid,
}

export type MultiViewTab = {
  id: string
  label: string
  content: (record: MultiRecord) => React.ReactNode
}

export type MultiViewProps = {
  title: string
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  views: readonly ViewConfig[]
  locale?: string
  weekStartsOn?: number
  today?: string
  url?: UrlAdapter | null
  /** Limits the switcher to these view ids. Omit it to keep every view enabled. */
  enabledViews?: readonly string[]
  onEnabledViewsChange?: (ids: string[]) => void
  /** Remembers the enabled set for one project or for every project. */
  persistViews?: ViewPersistence
  /** Shows the animated switcher and the view menu. Also turns on when enabled views are controlled. */
  customizeViews?: boolean
  viewCustomizeTitle?: string
  viewCustomizeSubtitle?: string
  viewCustomizeFooter?: React.ReactNode
  onRecordChange?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  onCreate?: (draft: Record<string, unknown>) => Promise<void> | void
  onDelete?: (ids: readonly string[]) => Promise<void> | void
  onMove?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  tabs?: readonly MultiViewTab[]
  bulkActions?: (ids: readonly string[]) => React.ReactNode
  busy?: boolean
  className?: string
  toolbarClassName?: string
  switcherClassName?: string
  searchClassName?: string
  viewClassName?: string
  panelClassName?: string
  addLabel?: string
  searchLabel?: string
  emptyLabel?: string
}

export function MultiView({
  title,
  records,
  fields,
  views,
  locale,
  weekStartsOn = 1,
  today,
  url,
  enabledViews,
  onEnabledViewsChange,
  persistViews,
  customizeViews = false,
  viewCustomizeTitle = "Views",
  viewCustomizeSubtitle,
  viewCustomizeFooter,
  onRecordChange,
  onCreate,
  onDelete,
  onMove,
  tabs = [],
  bulkActions,
  busy = false,
  className,
  toolbarClassName,
  switcherClassName,
  searchClassName,
  viewClassName,
  panelClassName,
  addLabel = "Add",
  searchLabel = "Search",
  emptyLabel = "No records",
}: MultiViewProps) {
  const customizing = customizeViews || enabledViews !== undefined || persistViews !== undefined || onEnabledViewsChange !== undefined
  const state = useMultiView({
    views,
    url,
    enabledViews,
    onEnabledViewsChange,
    persistViews,
  })
  const shownViews = customizing ? views.filter((view) => state.enabledViews.includes(view.id)) : views
  const data = useOptimisticRecords({
    records,
    onRecordChange,
    onCreate,
    onDelete,
    onMove,
  })
  const visible = React.useMemo(() => {
    const searched = searchRecords(data.records, fields, state.query, locale)
    const filtered = filterRecords(searched, fields, state.filters, locale)
    return sortRecords(filtered, fields, state.sort, locale)
  }, [data.records, fields, locale, state.filters, state.query, state.sort])

  const [createOpen, setCreateOpen] = React.useState(false)
  const [createSeed, setCreateSeed] = React.useState<Record<string, unknown>>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [mode, setMode] = React.useState<LayeredPanelMode>("peek")
  const [tab, setTab] = React.useState("details")
  const openRecord = data.records.find((record) => record.id === state.openId) ?? null

  function openCreate(seed: Record<string, unknown> = {}) {
    setCreateSeed(seed)
    setFormError(null)
    setCreateOpen(true)
  }

  function exportCsv(ids: readonly string[]) {
    const rows = ids.length ? visible.filter((record) => ids.includes(record.id)) : visible
    downloadCsv(title.toLowerCase().replace(/\s+/g, "-") || "records", recordsToCsv(rows, fields, locale))
  }

  const count = new Intl.NumberFormat(locale).format(visible.length)
  const selectedCount = state.selectedIds.length

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {selectedCount > 0 ? (
        <SelectionBar
          count={selectedCount}
          locale={locale}
          className={toolbarClassName}
          views={shownViews}
          viewId={state.viewId}
          onViewChange={state.setViewId}
          onClear={state.clearSelection}
          onExport={() => exportCsv(state.selectedIds)}
          onDelete={() => setConfirmDelete(true)}
          extra={bulkActions?.(state.selectedIds)}
        />
      ) : (
        <Toolbar
          title={title}
          count={count}
          views={shownViews}
          allViews={views}
          enabledViews={state.enabledViews}
          onEnabledViewsChange={state.setEnabledViews}
          customizing={customizing}
          viewCustomizeTitle={viewCustomizeTitle}
          viewCustomizeSubtitle={viewCustomizeSubtitle}
          viewCustomizeFooter={viewCustomizeFooter}
          viewId={state.viewId}
          onViewChange={state.setViewId}
          query={state.query}
          onQueryChange={state.setQuery}
          fields={fields}
          filters={state.filters}
          onFiltersChange={state.setFilters}
          sort={state.sort}
          onSortChange={state.setSort}
          groupBy={state.groupBy}
          onGroupByChange={state.setGroupBy}
          onAdd={() => openCreate()}
          addLabel={addLabel}
          searchLabel={searchLabel}
          className={toolbarClassName}
          switcherClassName={switcherClassName}
          searchClassName={searchClassName}
        />
      )}
      <div className={cn("min-w-0", viewClassName)}>
        <ActiveView
          view={state.active}
          records={visible}
          fields={fields}
          locale={locale}
          weekStartsOn={weekStartsOn}
          today={today}
          groupBy={state.groupBy}
          sort={state.sort}
          onSortChange={state.setSort}
          selectedIds={state.selectedIds}
          onSelectedIdsChange={state.setSelectedIds}
          onOpen={(id) => {
            setMode("peek")
            setTab("details")
            state.setOpenId(id)
          }}
          onDelete={(ids) => data.remove(ids)}
          onMove={(id, patch) => data.move(id, patch)}
          onCreateRequest={openCreate}
          emptyLabel={emptyLabel}
        />
      </div>
      <LayeredPanel
        open={Boolean(openRecord)}
        onOpenChange={(open) => {
          if (!open) state.setOpenId(null)
        }}
        mode={mode}
        onModeChange={setMode}
        title={openRecord ? recordTitle(openRecord, fields, state.active?.titleField) : title}
        className={panelClassName}
      >
        <LayeredPanel.Header>
          {openRecord ? (
            <TitleEditor
              record={openRecord}
              fields={fields}
              titleField={state.active?.titleField}
              onCommit={(patch) => data.update(openRecord.id, patch)}
            />
          ) : null}
        </LayeredPanel.Header>
        <LayeredPanel.ExpandToggle expandLabel="Expand record" collapseLabel="Collapse record" />
        <LayeredPanel.Peek>
          {openRecord && mode === "peek" ? (
            <RecordBody
              record={openRecord}
              fields={fields}
              locale={locale}
              tab={tab}
              tabs={tabs}
              onTabChange={setTab}
              onChange={(id, patch) => data.update(id, patch)}
            />
          ) : openRecord ? (
            <p className="truncate text-sm text-muted-foreground" dir="auto">
              {recordTitle(openRecord, fields, state.active?.titleField)}
            </p>
          ) : null}
        </LayeredPanel.Peek>
        <LayeredPanel.Full>
          {openRecord && mode === "full" ? (
            <RecordBody
              record={openRecord}
              fields={fields}
              locale={locale}
              tab={tab}
              tabs={tabs}
              onTabChange={setTab}
              onChange={(id, patch) => data.update(id, patch)}
            />
          ) : null}
        </LayeredPanel.Full>
      </LayeredPanel>
      <EntityForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={addLabel}
        description={formError ?? undefined}
        busy={busy}
        onSubmit={async (formData) => {
          const draft = { ...createSeed, ...draftFromFormData(formData, fields) }
          const error = validateDraft(draft, fields, state.active?.titleField)
          if (error) {
            setFormError(error)
            throw new Error(error)
          }
          setFormError(null)
          await data.create(draft)
        }}
      >
        <CreateFields fields={fields} seed={createSeed} />
      </EntityForm>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete records</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selectedCount} selected {selectedCount === 1 ? "record" : "records"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const ids = state.selectedIds
                state.clearSelection()
                void data.remove(ids)
              }}
            >
              Delete records
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RecordBody({
  record,
  fields,
  locale,
  tab,
  tabs,
  onTabChange,
  onChange,
}: {
  record: MultiRecord
  fields: readonly FieldDef[]
  locale?: string
  tab: string
  tabs: readonly MultiViewTab[]
  onTabChange: (tab: string) => void
  onChange: (id: string, patch: Record<string, unknown>) => Promise<void> | void
}) {
  const active = tabs.find((item) => item.id === tab)
  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {tabs.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {tab === "details" || !active ? (
        <RecordProperties record={record} fields={fields} locale={locale} onChange={onChange} />
      ) : (
        active.content(record)
      )}
    </div>
  )
}

function TitleEditor({
  record,
  fields,
  titleField,
  onCommit,
}: {
  record: MultiRecord
  fields: readonly FieldDef[]
  titleField?: string
  onCommit: (patch: Record<string, unknown>) => Promise<void> | void
}) {
  const field = fields.find((item) => item.id === titleField) ?? fields.find((item) => item.type === "text")
  const current = field ? String(record[field.id] ?? "") : recordTitle(record, fields, titleField)
  const [value, setValue] = React.useState(current)
  const [seen, setSeen] = React.useState(current)
  if (seen !== current) {
    setSeen(current)
    setValue(current)
  }
  if (!field || field.readOnly) {
    return <h2 className="truncate text-lg font-semibold" dir="auto">{current}</h2>
  }
  return (
    <input
      aria-label={field.label}
      value={value}
      dir="auto"
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => {
        if (value !== current) void onCommit({ [field.id]: value })
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          void onCommit({ [field.id]: value })
        }
        if (event.key === "Escape") {
          setValue(current)
          event.currentTarget.blur()
        }
      }}
      className="w-full truncate bg-transparent text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  )
}

function SelectionBar({
  count,
  locale,
  className,
  views,
  viewId,
  onViewChange,
  onClear,
  onExport,
  onDelete,
  extra,
}: {
  count: number
  locale?: string
  className?: string
  views: readonly ViewConfig[]
  viewId: string
  onViewChange: (id: string) => void
  onClear: () => void
  onExport: () => void
  onDelete: () => void
  extra?: React.ReactNode
}) {
  const label = new Intl.NumberFormat(locale).format(count)
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2", className)}>
      <p className="text-sm font-medium">{label} selected</p>
      <ViewSwitcher views={views} viewId={viewId} mode="icons" onViewChange={onViewChange} />
      <Button type="button" variant="ghost" size="sm" onClick={onClear}>
        <X className="size-3.5" />
        Clear
      </Button>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {extra}
        <Button type="button" variant="outline" size="sm" onClick={onExport}>
          <Download className="size-3.5" />
          Export CSV
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  )
}

function Toolbar({
  title,
  count,
  views,
  allViews,
  enabledViews,
  onEnabledViewsChange,
  customizing = false,
  viewCustomizeTitle,
  viewCustomizeSubtitle,
  viewCustomizeFooter,
  viewId,
  onViewChange,
  query,
  onQueryChange,
  fields,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  groupBy,
  onGroupByChange,
  onAdd,
  addLabel,
  searchLabel,
  className,
  switcherClassName,
  searchClassName,
}: {
  title: string
  count: string
  views: readonly ViewConfig[]
  allViews: readonly ViewConfig[]
  enabledViews: readonly string[]
  onEnabledViewsChange: (ids: string[]) => void
  customizing?: boolean
  viewCustomizeTitle: string
  viewCustomizeSubtitle?: string
  viewCustomizeFooter?: React.ReactNode
  viewId: string
  onViewChange: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
  fields: readonly FieldDef[]
  filters: readonly FilterClause[]
  onFiltersChange: (filters: FilterClause[]) => void
  sort: SortClause | null
  onSortChange: (sort: SortClause | null) => void
  groupBy: string | null
  onGroupByChange: (groupBy: string | null) => void
  onAdd: () => void
  addLabel: string
  searchLabel: string
  className?: string
  switcherClassName?: string
  searchClassName?: string
}) {
  const [ref, width] = useContainerWidth<HTMLDivElement>()
  const mode = width > 0 && width < 360 ? "select" : width > 0 && width < 640 ? "icons" : "labels"
  const groupable = fields.filter((field) =>
    field.type === "select" || field.type === "status" || field.type === "person" || field.type === "relation",
  )
  return (
    <div ref={ref} className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{count}</p>
      </div>
      {customizing ? (
        <AnimatedViewSwitcher
          className={switcherClassName}
          views={views.map((view) => {
            const Icon = VIEW_ICONS[view.kind]
            return { id: view.id, label: view.label, icon: <Icon className="size-3.5" /> }
          })}
          value={viewId}
          onValueChange={onViewChange}
          menu={
            <ViewCustomizer
              title={viewCustomizeTitle}
              subtitle={viewCustomizeSubtitle}
              footer={viewCustomizeFooter}
              views={allViews.map((view) => {
                const Icon = VIEW_ICONS[view.kind]
                return { id: view.id, label: view.label, icon: <Icon className="size-3.5" /> }
              })}
              enabled={enabledViews}
              onEnabledChange={onEnabledViewsChange}
            >
              <Button type="button" variant="outline" size="icon-sm" className="rounded-full" aria-label={viewCustomizeTitle}>
                <MoreHorizontal />
              </Button>
            </ViewCustomizer>
          }
        />
      ) : (
        <ViewSwitcher
          views={views}
          viewId={viewId}
          mode={mode}
          onViewChange={onViewChange}
          className={switcherClassName}
        />
      )}
      <div className={cn("relative min-w-0 flex-1 basis-36", searchClassName)}>
        <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="pl-7"
        />
      </div>
      <FilterMenu fields={fields} filters={filters} onChange={onFiltersChange} />
      <SortMenu fields={fields} sort={sort} onChange={onSortChange} />
      <GroupMenu fields={groupable} groupBy={groupBy} onChange={onGroupByChange} />
      <Button type="button" size="sm" onClick={onAdd}>
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  )
}

function ViewSwitcher({
  views,
  viewId,
  mode,
  onViewChange,
  className,
}: {
  views: readonly ViewConfig[]
  viewId: string
  mode: "select" | "icons" | "labels"
  onViewChange: (id: string) => void
  className?: string
}) {
  if (mode === "select") {
    return (
      <select
        aria-label="View"
        className={cn("h-8 rounded-md border border-input bg-background px-2 text-sm", className)}
        value={viewId}
        onChange={(event) => onViewChange(event.target.value)}
      >
        {views.map((view) => (
          <option key={view.id} value={view.id}>
            {view.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <div role="radiogroup" aria-label="View" className={cn("flex rounded-lg border border-border p-0.5", className)}>
      {views.map((view) => {
        const Icon = VIEW_ICONS[view.kind]
        const active = view.id === viewId
        return (
          <button
            key={view.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
            onClick={() => onViewChange(view.id)}
          >
            <Icon className="size-3.5" />
            <span className={mode === "icons" ? "sr-only" : undefined}>{view.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const OPS: { op: FilterOp; label: string }[] = [
  { op: "contains", label: "contains" },
  { op: "is", label: "is" },
  { op: "isNot", label: "is not" },
  { op: "gt", label: "greater than" },
  { op: "lt", label: "less than" },
  { op: "before", label: "before" },
  { op: "after", label: "after" },
  { op: "empty", label: "is empty" },
  { op: "notEmpty", label: "is not empty" },
]

function FilterMenu({
  fields,
  filters,
  onChange,
}: {
  fields: readonly FieldDef[]
  filters: readonly FilterClause[]
  onChange: (filters: FilterClause[]) => void
}) {
  const [field, setField] = React.useState(fields[0]?.id ?? "")
  const [op, setOp] = React.useState<FilterOp>("contains")
  const [value, setValue] = React.useState("")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Filter{filters.length ? ` (${filters.length})` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuLabel>Filter</DropdownMenuLabel>
        {filters.map((clause) => (
          <DropdownMenuItem
            key={clause.id}
            onSelect={() => onChange(filters.filter((item) => item.id !== clause.id))}
          >
            {fieldById(fields, clause.field)?.label ?? clause.field} {clause.op} {clause.value}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="grid gap-2 p-2" onKeyDown={(event) => event.stopPropagation()}>
          <select className="h-8 rounded-md border border-input bg-background px-2 text-sm" value={field} onChange={(event) => setField(event.target.value)} aria-label="Filter field">
            {fields.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <select className="h-8 rounded-md border border-input bg-background px-2 text-sm" value={op} onChange={(event) => setOp(event.target.value as FilterOp)} aria-label="Filter operator">
            {OPS.map((item) => (
              <option key={item.op} value={item.op}>{item.label}</option>
            ))}
          </select>
          <Input aria-label="Filter value" value={value} onChange={(event) => setValue(event.target.value)} />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!field) return
              onChange([...filters, { id: `f_${filters.length}_${field}`, field, op, value }])
              setValue("")
            }}
          >
            Add filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortMenu({
  fields,
  sort,
  onChange,
}: {
  fields: readonly FieldDef[]
  sort: SortClause | null
  onChange: (sort: SortClause | null) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">Sort</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onChange(null)}>None</DropdownMenuItem>
        {fields.map((field) => (
          <DropdownMenuItem
            key={field.id}
            onSelect={() =>
              onChange({
                field: field.id,
                direction: sort?.field === field.id && sort.direction === "asc" ? "desc" : "asc",
              })
            }
          >
            {field.label}
            {sort?.field === field.id ? ` (${sort.direction})` : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function GroupMenu({
  fields,
  groupBy,
  onChange,
}: {
  fields: readonly FieldDef[]
  groupBy: string | null
  onChange: (groupBy: string | null) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm">Group</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onChange(null)}>None</DropdownMenuItem>
        {fields.map((field) => (
          <DropdownMenuItem key={field.id} onSelect={() => onChange(field.id)}>
            {field.label}
            {groupBy === field.id ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateFields({
  fields,
  seed,
}: {
  fields: readonly FieldDef[]
  seed: Record<string, unknown>
}) {
  return (
    <>
      {fields.filter((field) => !field.readOnly).map((field) => (
        <label key={field.id} className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{field.label}</span>
          {field.type === "select" || field.type === "status" ? (
            <select
              name={field.id}
              defaultValue={typeof seed[field.id] === "string" ? String(seed[field.id]) : ""}
              className="h-9 rounded-md border border-input bg-background px-2"
            >
              <option value="">Select</option>
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : field.type === "boolean" ? (
            <input type="checkbox" name={field.id} value="true" defaultChecked={seed[field.id] === true} />
          ) : field.type === "date" ? (
            <input type="date" name={field.id} defaultValue={typeof seed[field.id] === "string" ? String(seed[field.id]) : ""} className="h-9 rounded-md border border-input bg-background px-2" />
          ) : field.type === "daterange" ? (
            <span className="flex gap-2">
              <input type="date" name={field.id} className="h-9 flex-1 rounded-md border border-input bg-background px-2" />
              <input type="date" name={`${field.id}__end`} className="h-9 flex-1 rounded-md border border-input bg-background px-2" />
            </span>
          ) : (
            <Input
              name={field.id}
              type={field.type === "number" || field.type === "currency" || field.type === "progress" ? "number" : "text"}
              defaultValue={seed[field.id] == null ? "" : String(seed[field.id])}
            />
          )}
        </label>
      ))}
    </>
  )
}

function ActiveView({
  view,
  records,
  fields,
  locale,
  weekStartsOn,
  today,
  groupBy,
  sort,
  onSortChange,
  selectedIds,
  onSelectedIdsChange,
  onOpen,
  onDelete,
  onMove,
  onCreateRequest,
  emptyLabel,
}: {
  view: ViewConfig | undefined
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  locale?: string
  weekStartsOn: number
  today?: string
  groupBy: string | null
  sort: SortClause | null
  onSortChange: (sort: SortClause | null) => void
  selectedIds: readonly string[]
  onSelectedIdsChange: (ids: string[]) => void
  onOpen: (id: string) => void
  onDelete: (ids: readonly string[]) => Promise<void> | void
  onMove: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  onCreateRequest: (seed: Record<string, unknown>) => void
  emptyLabel: string
}) {
  if (!view) return null
  const config = { ...view, groupField: groupBy ?? undefined }
  if (view.kind === "table") {
    return (
      <ViewTable
        records={records}
        fields={fields}
        config={config}
        locale={locale}
        sort={sort}
        onSortChange={onSortChange}
        selectedIds={selectedIds}
        onSelectedIdsChange={onSelectedIdsChange}
        onOpen={onOpen}
        onDelete={onDelete}
        emptyLabel={emptyLabel}
      />
    )
  }
  if (view.kind === "kanban") {
    return (
      <ViewKanban
        records={records}
        fields={fields}
        config={config}
        locale={locale}
        selectedIds={selectedIds}
        onSelectedIdsChange={onSelectedIdsChange}
        onOpen={onOpen}
        onDelete={onDelete}
        onMove={onMove}
        onCreateRequest={onCreateRequest}
        emptyLabel={emptyLabel}
      />
    )
  }
  if (view.kind === "calendar") {
    return (
      <ViewCalendar
        records={records}
        fields={fields}
        config={config}
        locale={locale}
        weekStartsOn={weekStartsOn}
        today={today}
        onOpen={onOpen}
        onMove={onMove}
      />
    )
  }
  if (view.kind === "timeline") {
    return (
      <ViewTimeline
        records={records}
        fields={fields}
        config={config}
        locale={locale}
        weekStartsOn={weekStartsOn}
        today={today}
        onOpen={onOpen}
        onMove={onMove}
      />
    )
  }
  if (view.kind === "grouped-list") {
    return (
      <ViewGroupedList
        records={records}
        fields={fields}
        config={config}
        locale={locale}
        onOpen={onOpen}
        emptyLabel={emptyLabel}
      />
    )
  }
  return (
    <ViewGallery
      records={records}
      fields={fields}
      config={config}
      locale={locale}
      onOpen={onOpen}
      emptyLabel={emptyLabel}
    />
  )
}
