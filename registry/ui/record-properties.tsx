"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  asPerson,
  isEmptyValue,
  parseDateOnly,
  type FieldDef,
  type MultiRecord,
} from "@/registry/retana/lib/multi-view"
import { FieldDisplay, FieldIcon } from "@/registry/retana/ui/multi-view-fields"

export type RecordPropertiesProps = {
  record: MultiRecord
  fields: readonly FieldDef[]
  locale?: string
  onChange?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  className?: string
  sectionClassName?: string
  rowClassName?: string
  labelClassName?: string
  valueClassName?: string
}

export function RecordProperties({
  record,
  fields,
  locale,
  onChange,
  className,
  sectionClassName,
  rowClassName,
  labelClassName,
  valueClassName,
}: RecordPropertiesProps) {
  const sections = React.useMemo(() => {
    const map = new Map<string, FieldDef[]>()
    for (const field of fields) {
      const name = field.section ?? "Details"
      const list = map.get(name)
      if (list) list.push(field)
      else map.set(name, [field])
    }
    return [...map.entries()]
  }, [fields])

  return (
    <div className={cn("@container flex flex-col gap-5", className)}>
      {sections.map(([name, sectionFields]) => (
        <section key={name} className={sectionClassName}>
          <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{name}</h3>
          <div className="grid gap-1">
            {sectionFields.map((field) => (
              <PropertyRow
                key={field.id}
                record={record}
                field={field}
                locale={locale}
                onChange={onChange}
                className={rowClassName}
                labelClassName={labelClassName}
                valueClassName={valueClassName}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function PropertyRow({
  record,
  field,
  locale,
  onChange,
  className,
  labelClassName,
  valueClassName,
}: {
  record: MultiRecord
  field: FieldDef
  locale?: string
  onChange?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  className?: string
  labelClassName?: string
  valueClassName?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [pending, setPending] = React.useState<unknown>(undefined)
  const [hasPending, setHasPending] = React.useState(false)
  const value = hasPending ? pending : record[field.id]

  async function commit(next: unknown) {
    setPending(next)
    setHasPending(true)
    setEditing(false)
    try {
      await onChange?.(record.id, { [field.id]: next })
      setHasPending(false)
    } catch {
      setHasPending(false)
      setPending(undefined)
    }
  }

  function start() {
    if (field.readOnly || !onChange) return
    if (field.type === "text" || field.type === "url" || field.type === "number" || field.type === "currency" || field.type === "progress") {
      const current = record[field.id]
      setDraft(current == null ? "" : String(current))
      setEditing(true)
      return
    }
    if (field.type === "person" || field.type === "relation") {
      setDraft(asPerson(record[field.id])?.name ?? "")
      setEditing(true)
    }
  }

  function cancel() {
    setEditing(false)
  }

  async function commitDraft() {
    if (field.type === "number" || field.type === "currency" || field.type === "progress") {
      if (draft.trim() === "") {
        await commit(null)
        return
      }
      const n = Number(draft)
      if (!Number.isFinite(n)) return
      await commit(n)
      return
    }
    if (field.type === "person" || field.type === "relation") {
      await commit(draft.trim() ? { name: draft.trim() } : null)
      return
    }
    await commit(draft)
  }

  return (
    <div className={cn("grid min-w-0 grid-cols-1 items-start gap-1 py-1 @min-[22rem]:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] @min-[22rem]:items-center @min-[22rem]:gap-2", className)}>
      <div className={cn("flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground", labelClassName)}>
        <FieldIcon name={field.icon} className="size-3.5 shrink-0" />
        <span className="truncate">{field.label}</span>
      </div>
      <div className={cn("min-w-0 text-sm break-words", valueClassName)}>
        {field.readOnly || !onChange ? (
          <FieldDisplay field={field} value={value} locale={locale} />
        ) : field.type === "boolean" ? (
          <Checkbox
            aria-label={field.label}
            checked={value === true}
            onCheckedChange={(checked) => void commit(checked === true)}
          />
        ) : field.type === "select" || field.type === "status" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring">
                <FieldDisplay field={field} value={value} locale={locale} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(field.options ?? []).map((option) => (
                <DropdownMenuItem key={option.value} onSelect={() => void commit(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : field.type === "date" ? (
          <DateEditor field={field} value={value} locale={locale} onCommit={(next) => void commit(next)} />
        ) : editing ? (
          <Input
            autoFocus
            aria-label={field.label}
            value={draft}
            inputMode={field.type === "number" || field.type === "currency" || field.type === "progress" ? "decimal" : undefined}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void commitDraft()
              }
              if (event.key === "Escape") {
                event.preventDefault()
                cancel()
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="max-w-full truncate rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring"
            onClick={start}
          >
            {isEmptyValue(value) ? <span className="text-muted-foreground">Empty</span> : <FieldDisplay field={field} value={value} locale={locale} />}
          </button>
        )}
      </div>
    </div>
  )
}

function DateEditor({
  field,
  value,
  locale,
  onCommit,
}: {
  field: FieldDef
  value: unknown
  locale?: string
  onCommit: (value: string | null) => void
}) {
  const iso = typeof value === "string" && parseDateOnly(value) ? value : ""
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring" aria-label={field.label}>
          <FieldDisplay field={field} value={value} locale={locale} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Input
          type="date"
          aria-label={field.label}
          defaultValue={iso}
          onChange={(event) => onCommit(event.target.value || null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.blur()
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function propertySections(fields: readonly FieldDef[]): string[] {
  return [...new Set(fields.map((field) => field.section ?? "Details"))]
}
