"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { formatDeskDate, isOverdueDate, type DeskOption } from "@/registry/retana/lib/inbox"
import type { FieldDef, MultiRecord } from "@/registry/retana/lib/multi-view"
import { PriorityBadge, type PriorityLevel } from "@/registry/retana/ui/priority-badge"
import { RecordProperties } from "@/registry/retana/ui/record-properties"
import { TagInput } from "@/registry/retana/ui/tag-input"

const BADGE_LEVEL: Record<string, PriorityLevel | null> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
  urgent: "critical",
  none: null,
}

export type TicketSla = {
  text: string
  overdue?: boolean
}

export type TicketPropertiesClassNames = {
  root?: string
  row?: string
  label?: string
  value?: string
}

export type TicketPropertiesProps = {
  id?: string
  title?: string
  locale?: string
  /** Calendar day used to decide if the due date is overdue. */
  today: string
  status?: string
  statusOptions?: readonly DeskOption[]
  onStatusChange?: (value: string) => void
  statusLabel?: string
  priority?: string
  priorityOptions?: readonly DeskOption[]
  onPriorityChange?: (value: string) => void
  priorityLabel?: string
  type?: string
  typeOptions?: readonly DeskOption[]
  onTypeChange?: (value: string) => void
  typeLabel?: string
  assignee?: string
  assigneeOptions?: readonly DeskOption[]
  onAssigneeChange?: (value: string) => void
  assigneeLabel?: string
  due?: string
  onDueChange?: (value: string) => void
  dueLabel?: string
  overdueLabel?: string
  channel?: string
  created?: string
  updated?: string
  channelLabel?: string
  createdLabel?: string
  updatedLabel?: string
  metaLabel?: string
  sla?: TicketSla
  slaLabel?: string
  tags?: readonly string[]
  onTagsChange?: (tags: string[]) => void
  tagsLabel?: string
  className?: string
  classNames?: TicketPropertiesClassNames
}

function SelectRow({
  label,
  value,
  options,
  onChange,
  classNames,
  extra,
}: {
  label: string
  value?: string
  options: readonly DeskOption[]
  onChange?: (value: string) => void
  classNames?: TicketPropertiesClassNames
  extra?: React.ReactNode
}) {
  return (
    <label className={cn("grid gap-1 text-sm", classNames?.row)}>
      <span className={cn("text-xs text-muted-foreground", classNames?.label)}>{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <select
          aria-label={label}
          value={value ?? ""}
          disabled={!onChange}
          onChange={(event) => onChange?.(event.target.value)}
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-70"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {extra}
      </span>
    </label>
  )
}

export function TicketProperties({
  id = "ticket",
  title = "Properties",
  locale,
  today,
  status,
  statusOptions,
  onStatusChange,
  statusLabel = "Status",
  priority,
  priorityOptions,
  onPriorityChange,
  priorityLabel = "Priority",
  type,
  typeOptions,
  onTypeChange,
  typeLabel = "Type",
  assignee,
  assigneeOptions,
  onAssigneeChange,
  assigneeLabel = "Assignee",
  due,
  onDueChange,
  dueLabel = "Due",
  overdueLabel = "Overdue",
  channel,
  created,
  updated,
  channelLabel = "Channel",
  createdLabel = "Created",
  updatedLabel = "Updated",
  metaLabel = "Record",
  sla,
  slaLabel = "SLA",
  tags,
  onTagsChange,
  tagsLabel = "Tags",
  className,
  classNames,
}: TicketPropertiesProps) {
  const overdue = isOverdueDate(due, today)
  const badge = priority ? BADGE_LEVEL[priority] : undefined
  const metaFields: FieldDef[] = []
  const record: MultiRecord = { id }
  if (channel) {
    metaFields.push({ id: "channel", label: channelLabel, type: "text", icon: "link", readOnly: true, section: metaLabel })
    record.channel = channel
  }
  if (created) {
    metaFields.push({ id: "created", label: createdLabel, type: "text", icon: "calendar", readOnly: true, section: metaLabel })
    record.created = created
  }
  if (updated) {
    metaFields.push({ id: "updated", label: updatedLabel, type: "text", icon: "calendar", readOnly: true, section: metaLabel })
    record.updated = updated
  }

  return (
    <section data-slot="ticket-properties" aria-label={title} className={cn("flex min-w-0 flex-col gap-4 p-3", className, classNames?.root)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {statusOptions?.length ? (
        <SelectRow label={statusLabel} value={status} options={statusOptions} onChange={onStatusChange} classNames={classNames} />
      ) : null}
      {priorityOptions?.length ? (
        <SelectRow
          label={priorityLabel}
          value={priority}
          options={priorityOptions}
          onChange={onPriorityChange}
          classNames={classNames}
          extra={badge ? <PriorityBadge level={badge} label={priorityOptions.find((option) => option.value === priority)?.label} /> : null}
        />
      ) : null}
      {typeOptions?.length ? (
        <SelectRow label={typeLabel} value={type} options={typeOptions} onChange={onTypeChange} classNames={classNames} />
      ) : null}
      {assigneeOptions?.length ? (
        <SelectRow label={assigneeLabel} value={assignee} options={assigneeOptions} onChange={onAssigneeChange} classNames={classNames} />
      ) : null}
      {due !== undefined || onDueChange ? (
        <label className={cn("grid gap-1 text-sm", classNames?.row)}>
          <span className={cn("text-xs text-muted-foreground", classNames?.label)}>{dueLabel}</span>
          <input
            type="date"
            aria-label={dueLabel}
            value={due ?? ""}
            readOnly={!onDueChange}
            onChange={(event) => onDueChange?.(event.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          {due ? (
            <span
              data-slot="ticket-due"
              data-overdue={overdue ? "true" : "false"}
              className={cn("text-xs tabular-nums", overdue ? "font-medium text-destructive" : "text-muted-foreground", classNames?.value)}
            >
              {formatDeskDate(due, locale)}
              {overdue ? ` · ${overdueLabel}` : ""}
            </span>
          ) : null}
        </label>
      ) : null}
      {metaFields.length ? <RecordProperties record={record} fields={metaFields} locale={locale} /> : null}
      {sla ? (
        <div className={cn("grid gap-1 text-sm", classNames?.row)} data-slot="ticket-sla" data-overdue={sla.overdue ? "true" : "false"}>
          <span className={cn("text-xs text-muted-foreground", classNames?.label)}>{slaLabel}</span>
          <span className={cn("text-sm wrap-anywhere", sla.overdue ? "font-medium text-destructive" : "text-foreground", classNames?.value)}>
            {sla.text}
          </span>
        </div>
      ) : null}
      {tags ? (
        <TagInput label={tagsLabel} value={[...tags]} onValueChange={onTagsChange} />
      ) : null}
    </section>
  )
}
