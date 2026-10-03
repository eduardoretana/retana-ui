"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  fieldById,
  groupRecords,
  recordTitle,
  type FieldDef,
  type MultiRecord,
  type ViewConfig,
} from "@/registry/retana/lib/multi-view"
import { FieldDisplay, FieldIcon, displayFields } from "@/registry/retana/ui/multi-view-fields"

export type ViewGroupedListProps = {
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config: ViewConfig
  locale?: string
  onOpen?: (id: string) => void
  emptyLabel?: string
  className?: string
  groupClassName?: string
  rowClassName?: string
}

export function ViewGroupedList({
  records,
  fields,
  config,
  locale,
  onOpen,
  emptyLabel = "No items",
  className,
  groupClassName,
  rowClassName,
}: ViewGroupedListProps) {
  const groups = groupRecords(records, fields, config.groupField, {
    includeEmpty: true,
    emptyLabel,
    locale,
  })
  const skip = new Set([config.titleField, config.subtitleField, config.groupField].filter((id): id is string => Boolean(id)))
  const trailing = displayFields(fields, config.cardFields, skip).slice(0, 6)
  const titleField = fieldById(fields, config.titleField) ?? fields.find((field) => field.type === "text")
  const subtitleField = fieldById(fields, config.subtitleField)

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {groups.map((group) => (
        <Group
          key={group.key || "empty"}
          label={group.label}
          count={group.records.length}
          empty={group.records.length === 0}
          emptyLabel={emptyLabel}
          className={groupClassName}
        >
          {group.records.map((record) => {
            const title = recordTitle(record, fields, config.titleField)
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => onOpen?.(record.id)}
                className={cn(
                  "flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  rowClassName,
                )}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <FieldIcon name={titleField?.icon ?? "text"} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium" dir="auto">
                    {title}
                  </span>
                  {subtitleField ? (
                    <span className="block truncate text-xs text-muted-foreground" dir="auto">
                      {String(record[subtitleField.id] ?? "")}
                    </span>
                  ) : null}
                </span>
                <span className="hidden min-w-0 items-center gap-3 sm:flex">
                  {trailing.map((field) => (
                    <span key={field.id} className="inline-flex max-w-36 items-center gap-1 text-xs">
                      <FieldIcon name={field.icon} className="size-3.5 shrink-0 text-muted-foreground" />
                      <FieldDisplay field={field} value={record[field.id]} locale={locale} />
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </Group>
      ))}
    </div>
  )
}

function Group({
  label,
  count,
  empty,
  emptyLabel,
  className,
  children,
}: {
  label: string
  count: number
  empty: boolean
  emptyLabel: string
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(true)
  return (
    <section className={cn("rounded-lg border border-border", className)}>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform motion-reduce:transition-none", !open && "-rotate-90")} />
        <span className="truncate">{label}</span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </button>
      {open ? (
        <div className="border-t border-border px-1 py-1">
          {empty ? <p className="px-3 py-4 text-sm text-muted-foreground">{emptyLabel}</p> : children}
        </div>
      ) : null}
    </section>
  )
}
