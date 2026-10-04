"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type SuggestedChoice = {
  id: string
  label: string
  description?: string
  suggested?: boolean
}

export type SuggestedChoiceField = {
  id: string
  label: string
  value?: string
  placeholder?: string
  options: readonly { value: string; label: string }[]
}

export type SuggestedChoiceDialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  subtitle?: string
  hint?: string
  options: readonly SuggestedChoice[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  fields?: readonly SuggestedChoiceField[]
  onFieldChange?: (id: string, value: string) => void
  onConfirm?: (choiceId: string, fields: Record<string, string>) => void
  confirmLabel?: string
  cancelLabel?: string
  suggestedLabel?: string
  busy?: boolean
  className?: string
}

export function SuggestedChoiceDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  subtitle,
  hint,
  options,
  value,
  defaultValue,
  onValueChange,
  fields = [],
  onFieldChange,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  suggestedLabel = "Suggested",
  busy = false,
  className,
}: SuggestedChoiceDialogProps) {
  const suggested = options.find((option) => option.suggested)?.id ?? options[0]?.id ?? ""
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? suggested)
  const [internalFields, setInternalFields] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.id, field.value ?? ""])),
  )
  const shown = open ?? internalOpen
  const selected = value ?? internalValue
  const fieldValues = Object.fromEntries(fields.map((field) => [field.id, field.value ?? internalFields[field.id] ?? ""]))
  const missing = fields.some((field) => !fieldValues[field.id])
  const groupName = React.useId()

  function setOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  function select(id: string) {
    if (value === undefined) setInternalValue(id)
    onValueChange?.(id)
  }

  function changeField(id: string, next: string) {
    setInternalFields((current) => ({ ...current, [id]: next }))
    onFieldChange?.(id, next)
  }

  return (
    <Dialog open={shown} onOpenChange={setOpen}>
      <DialogContent className={cn("@container max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        {hint ? (
          <p className="flex items-start gap-2 rounded-lg bg-chart-3/15 px-3 py-2 text-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{hint}</span>
          </p>
        ) : null}
        <div role="radiogroup" aria-label={title} className="flex flex-col gap-1 rounded-xl border border-border p-1">
          {options.map((option) => {
            const checked = option.id === selected
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-sm",
                  checked && "bg-muted",
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  className="mt-1 accent-primary"
                  value={option.id}
                  checked={checked}
                  autoFocus={checked}
                  onChange={() => select(option.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium break-words">{option.label}</span>
                    {option.suggested ? (
                      <span className="shrink-0 rounded-full bg-chart-3/15 px-2 py-0.5 text-xs">{suggestedLabel}</span>
                    ) : null}
                  </span>
                  {option.description ? <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span> : null}
                </span>
              </label>
            )
          })}
        </div>
        {fields.length ? (
          <div className="grid gap-3 @min-[26rem]:grid-cols-2">
            {fields.map((field) => (
              <label key={field.id} className="flex min-w-0 flex-col gap-1 text-sm">
                <span>{field.label}</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={fieldValues[field.id] ?? ""}
                  onChange={(event) => changeField(field.id, event.target.value)}
                >
                  <option value="">{field.placeholder ?? "Choose"}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="secondary" className="rounded-full" onClick={() => setOpen(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="rounded-full"
            disabled={busy || !selected || missing}
            onClick={() => {
              if (!selected) return
              onConfirm?.(selected, fieldValues)
            }}
          >
            {busy ? <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" aria-hidden /> : <Check data-icon="inline-start" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
