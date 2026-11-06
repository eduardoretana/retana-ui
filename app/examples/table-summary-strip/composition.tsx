"use client"

import type { LegacyColumnDef } from "@tanstack/react-table/legacy"

import type { SceneLocale } from "@/app/catalog/scene-types"
import { AdaptiveTable, type AdaptiveColumn, type AdaptiveGroup } from "@/registry/ui/adaptive-table"
import { AdminDataTable } from "@/registry/ui/data-table"
import { DataTableSparkline } from "@/registry/ui/data-table-reorder"
import { ExpandableTable, type ExpandableColumn, type ExpandableTableLabels } from "@/registry/ui/expandable-table"
import { StatusActionCell } from "@/registry/ui/status-action-cell"
import { TableSummaryStrip, type TableSummaryItem } from "@/registry/ui/table-summary-strip"
import { WorkTable, type WorkColumn } from "@/registry/ui/work-table"

import { actionsOf, chrome, lots, statusOf, summarySeeds, type Lot, type TableKind, type TableMode } from "./fixtures"

export type CompositionProps = {
  locale: SceneLocale
  kind: TableKind
  mode: TableMode
  narrow?: boolean
  onRetry?: () => void
  onAction?: (lotId: string, actionId: string) => void
  pendingKey?: string
  actionError?: { lotId: string; message: string }
}

function itemsFor(locale: SceneLocale, mode: TableMode): TableSummaryItem[] {
  const copy = chrome(locale)
  return summarySeeds(mode).map((item) => ({
    id: item.id,
    label: locale === "en" ? item.en : item.es,
    value: item.value,
    format: "number",
    sparkline: item.sparkline,
    sparklineLabel: item.sparkline ? copy.spark(locale === "en" ? item.en : item.es) : undefined,
  }))
}

function LotStatus({
  lot,
  locale,
  pendingKey,
  actionError,
  onAction,
}: {
  lot: Lot
  locale: SceneLocale
  pendingKey?: string
  actionError?: CompositionProps["actionError"]
  onAction?: CompositionProps["onAction"]
}) {
  const copy = chrome(locale)
  const status = statusOf(locale, lot.status)
  return (
    <StatusActionCell
      label={status.label}
      tone={status.tone}
      menuLabel={copy.menu}
      moreLabel={copy.more}
      error={actionError?.lotId === lot.id ? actionError.message : undefined}
      actions={actionsOf(locale, lot.status).map((action) => ({
        ...action,
        pending: pendingKey === `${lot.id}:${action.id}`,
        onClick: () => onAction?.(lot.id, action.id),
      }))}
    />
  )
}

function Summary({
  locale,
  mode,
  onRetry,
}: {
  locale: SceneLocale
  mode: TableMode
  onRetry?: () => void
}) {
  const copy = chrome(locale)
  const showZeros = mode === "zeros"
  return (
    <TableSummaryStrip
      locale={locale === "en" ? "en-US" : "es-MX"}
      items={itemsFor(locale, mode)}
      loading={mode === "loading"}
      error={mode === "error" ? copy.error : undefined}
      onRetry={mode === "error" ? onRetry : undefined}
      empty={showZeros ? "show" : "hide"}
      labels={{ loading: copy.loading, retry: copy.retry }}
      renderItem={showZeros ? () => <span className="text-xs text-muted-foreground">{copy.slot}</span> : undefined}
    />
  )
}

function dataColumns(locale: SceneLocale, props: CompositionProps): LegacyColumnDef<Lot>[] {
  const copy = chrome(locale)
  return [
    {
      accessorKey: "name",
      header: copy.name,
      enableSorting: false,
      cell: ({ row }) => row.original.name,
    },
    {
      id: "status",
      header: copy.status,
      enableSorting: false,
      cell: ({ row }) => (
        <LotStatus lot={row.original} locale={locale} pendingKey={props.pendingKey} actionError={props.actionError} onAction={props.onAction} />
      ),
    },
    {
      id: "trend",
      header: copy.trend,
      enableSorting: false,
      cell: ({ row }) => <DataTableSparkline values={row.original.trend} label={copy.spark(row.original.name)} />,
    },
  ]
}

function expandableColumns(locale: SceneLocale, props: CompositionProps): ExpandableColumn<Lot>[] {
  const copy = chrome(locale)
  return [
    { id: "name", header: copy.name, cell: (row) => row.name },
    { id: "status", header: copy.status, cell: (row) => <LotStatus lot={row} locale={locale} pendingKey={props.pendingKey} actionError={props.actionError} onAction={props.onAction} /> },
    { id: "trend", header: copy.trend, cell: (row) => <DataTableSparkline values={row.trend} label={copy.spark(row.name)} /> },
  ]
}

function expandableLabels(locale: SceneLocale): Partial<ExpandableTableLabels> | undefined {
  if (locale === "en") return undefined
  const copy = chrome(locale)
  return {
    search: copy.search,
    empty: copy.emptyTable,
    noMatches: copy.emptyTable,
    loading: copy.loadingTable,
    density: "Densidad",
    regular: "Regular",
    compact: "Compacta",
    expandAll: "Abrir todas",
    collapseAll: "Cerrar todas",
    previous: "Página anterior",
    next: "Página siguiente",
    page: (current, total) => `Página ${current} de ${total}`,
    rows: (count) => `${count} seleccionadas`,
    expand: (title) => `Abrir ${title}`,
    collapse: (title) => `Cerrar ${title}`,
    select: (title) => `Seleccionar ${title}`,
    selectPage: "Seleccionar las filas de esta página",
  }
}

function workColumns(locale: SceneLocale, props: CompositionProps): WorkColumn<Lot>[] {
  const copy = chrome(locale)
  return [
    { id: "name", header: copy.name, locked: true, cell: (row) => row.name },
    { id: "status", header: copy.status, cell: (row) => <LotStatus lot={row} locale={locale} pendingKey={props.pendingKey} actionError={props.actionError} onAction={props.onAction} /> },
    { id: "trend", header: copy.trend, cell: (row) => <DataTableSparkline values={row.trend} label={copy.spark(row.name)} /> },
  ]
}

function adaptiveColumns(locale: SceneLocale, props: CompositionProps): AdaptiveColumn<Lot>[] {
  const copy = chrome(locale)
  return [
    {
      id: "name",
      priority: 10,
      minWidth: 120,
      header: { icon: <span aria-hidden="true">A</span>, label: copy.name },
      render: (row) => <span className="font-medium">{row.name}</span>,
      textValue: (row) => row.name,
    },
    {
      id: "status",
      priority: 8,
      minWidth: 140,
      header: { icon: <span aria-hidden="true">S</span>, label: copy.status },
      render: (row) => <LotStatus lot={row} locale={locale} pendingKey={props.pendingKey} actionError={props.actionError} onAction={props.onAction} />,
      textValue: (row) => statusOf(locale, row.status).label,
    },
    {
      id: "trend",
      priority: 2,
      minWidth: 88,
      mergeInto: "name",
      header: { icon: <span aria-hidden="true">T</span>, label: copy.trend },
      render: (row) => <DataTableSparkline values={row.trend} label={copy.spark(row.name)} />,
      compactRender: (row) => <DataTableSparkline values={row.trend} label={copy.spark(row.name)} />,
      textValue: (row) => row.trend.join(" "),
    },
  ]
}

export function TableComposition(props: CompositionProps) {
  const { locale, kind, mode, narrow, onRetry } = props
  const copy = chrome(locale)
  const rows = mode === "empty" || mode === "loading" ? [] : lots
  const columns = dataColumns(locale, props)
  const expanded = expandableColumns(locale, props)
  const work = workColumns(locale, props)
  const adaptive = adaptiveColumns(locale, props)
  const groups: AdaptiveGroup<Lot>[] = [{ id: "open", label: copy.group, rows }]

  const body = (
    <div className="@container flex min-w-0 flex-col gap-3">
      {mode === "empty" ? <p className="text-sm text-muted-foreground">{copy.emptyNote}</p> : null}
      {kind === "data" ? (
        <AdminDataTable
          data={rows}
          columns={columns}
          leading={<Summary locale={locale} mode={mode} onRetry={onRetry} />}
          searchText={(row) => row.name}
          searchPlaceholder={copy.search}
          columnsLabel={copy.columns}
          previousLabel={copy.previous}
          nextLabel={copy.next}
          emptyTitle={copy.emptyTable}
        />
      ) : null}
      {kind === "expandable" ? (
        <ExpandableTable
          rows={rows}
          columns={expanded}
          rowTitle={(row) => row.name}
          searchText={(row) => row.name}
          leading={<Summary locale={locale} mode={mode} onRetry={onRetry} />}
          labels={expandableLabels(locale)}
          pageSize={5}
        />
      ) : null}
      {kind === "work" ? (
        <WorkTable
          rows={rows}
          columns={work}
          readOnly
          selectable={false}
          showOrder={false}
          paginate={false}
          leading={<Summary locale={locale} mode={mode} onRetry={onRetry} />}
          state={mode === "error" ? "error" : mode === "loading" ? "loading" : "ready"}
          errorMessage={copy.tableError}
          onRetry={onRetry}
          labels={
            locale === "en"
              ? {
                  table: "Series",
                  columns: copy.columns,
                  loading: copy.loadingTable,
                  errorTitle: "Could not load",
                  retry: copy.retry,
                  emptyTitle: copy.emptyTable,
                }
              : { retry: copy.retry }
          }
        />
      ) : null}
      {kind === "adaptive" ? (
        <AdaptiveTable
          columns={adaptive}
          groups={groups}
          getRowId={(row) => row.id}
          title={copy.group}
          locale={locale === "en" ? "en-US" : "es-MX"}
          loading={mode === "loading"}
          loadingLabel={copy.loadingTable}
          emptyState={<p>{copy.emptyTable}</p>}
          leading={<Summary locale={locale} mode={mode} onRetry={onRetry} />}
        />
      ) : null}
    </div>
  )

  if (!narrow) return body
  return <div className="w-[390px] max-w-full">{body}</div>
}
