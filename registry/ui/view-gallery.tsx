"use client"

import * as React from "react"
import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  fieldById,
  isEmptyValue,
  recordTitle,
  type FieldDef,
  type MultiRecord,
  type ViewConfig,
} from "@/registry/retana/lib/multi-view"
import { FieldDisplay, StatusPill } from "@/registry/retana/ui/multi-view-fields"

export type ViewGalleryProps = {
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config: ViewConfig
  locale?: string
  chip?: string | null
  onChipChange?: (chip: string | null) => void
  onOpen?: (id: string) => void
  footer?: (record: MultiRecord) => React.ReactNode
  emptyLabel?: string
  className?: string
  gridClassName?: string
  cardClassName?: string
  coverClassName?: string
}

export function ViewGallery({
  records,
  fields,
  config,
  locale,
  chip: chipProp,
  onChipChange,
  onOpen,
  footer,
  emptyLabel = "No records",
  className,
  gridClassName,
  cardClassName,
  coverClassName,
}: ViewGalleryProps) {
  const [chipState, setChipState] = React.useState<string | null>(null)
  const chip = chipProp !== undefined ? chipProp : chipState
  const setChip = (next: string | null) => {
    if (chipProp === undefined) setChipState(next)
    onChipChange?.(next)
  }
  const chipField = fieldById(fields, config.chipField)
  const coverField = fieldById(fields, config.coverField)
  const statusField = fields.find((field) => field.type === "status")
  const headline =
    fieldById(fields, config.headlineField) ??
    fields.find((field) => field.type === "currency" || field.type === "number")
  const description = fields.find((field) => field.type === "text" && field.id !== config.titleField)
  const visible = chip && chipField
    ? records.filter((record) => String(record[chipField.id] ?? "") === chip)
    : records

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {chipField?.options?.length ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label={chipField.label}>
          <Button type="button" size="sm" variant={chip == null ? "default" : "outline"} aria-pressed={chip == null} onClick={() => setChip(null)}>
            All
          </Button>
          {chipField.options.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={chip === option.value ? "default" : "outline"}
              aria-pressed={chip === option.value}
              onClick={() => setChip(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      ) : null}
      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className={cn("grid min-w-0 grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3", gridClassName)}>
          {visible.map((record) => {
            const title = recordTitle(record, fields, config.titleField)
            return (
              <li key={record.id} className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card", cardClassName)}>
                <Cover value={coverField ? record[coverField.id] : undefined} label={title} className={coverClassName} />
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                  {statusField && !isEmptyValue(record[statusField.id]) ? (
                    <StatusPill field={statusField} value={record[statusField.id]} />
                  ) : null}
                  <button
                    type="button"
                    className="truncate text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring"
                    dir="auto"
                    onClick={() => onOpen?.(record.id)}
                  >
                    {title}
                  </button>
                  {headline ? (
                    <p className="text-lg font-semibold tracking-tight">
                      <FieldDisplay field={headline} value={record[headline.id]} locale={locale} />
                    </p>
                  ) : null}
                  {description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground" dir="auto">
                      {String(record[description.id] ?? "")}
                    </p>
                  ) : null}
                  {footer ? <div className="mt-auto pt-2">{footer(record)}</div> : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Cover({
  value,
  label,
  className,
}: {
  value: unknown
  label: string
  className?: string
}) {
  const token = typeof value === "string" ? value : ""
  const remote = token.startsWith("http://") || token.startsWith("https://")
  return (
    <div className={cn("relative aspect-4/3 bg-muted ring-1 ring-border", className)}>
      {remote ? (
        // Host URLs are not known at build time, so this cannot use next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={token} alt="" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center text-muted-foreground">
          <ImageIcon className="size-6" aria-hidden />
          <span className="sr-only">{label}</span>
        </span>
      )}
    </div>
  )
}
