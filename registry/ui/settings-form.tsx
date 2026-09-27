"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUnsavedChanges } from "@/registry/retana/hooks/use-unsaved-changes"

export type SettingsField = {
  key: string
  label: string
  hint?: string
  kind?: "text" | "textarea" | "url"
  rows?: number
}

export type SettingsGroup = {
  id: string
  title: string
  description?: string
  fields: SettingsField[]
}

export type SettingsFormProps = {
  groups: readonly SettingsGroup[]
  values: Record<string, string>
  onSave: (values: Record<string, string>) => Promise<void> | void
  className?: string
  saveLabel?: string
  discardLabel?: string
  dirtyLabel?: string
  cleanLabel?: string
  leaveMessage?: string
  pendingLabel?: string
}

function sameValues(a: Record<string, string>, b: Record<string, string>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if ((a[key] ?? "") !== (b[key] ?? "")) return false
  }
  return true
}

export function SettingsForm({
  groups,
  values,
  onSave,
  className,
  saveLabel = "Save changes",
  discardLabel = "Discard",
  dirtyLabel = "Unsaved changes",
  cleanLabel = "All changes saved",
  leaveMessage = "You have unsaved changes.",
  pendingLabel = "Saving…",
}: SettingsFormProps) {
  const [draft, setDraft] = React.useState(values)
  const [baseline, setBaseline] = React.useState(values)
  const [pending, setPending] = React.useState(false)
  const key = JSON.stringify(values)
  const [seen, setSeen] = React.useState(key)
  if (seen !== key) {
    setSeen(key)
    setDraft(values)
    setBaseline(values)
  }
  const dirty = !sameValues(draft, baseline)
  useUnsavedChanges(dirty, leaveMessage)

  function setField(field: string, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  async function save() {
    setPending(true)
    try {
      await onSave(draft)
      setBaseline(draft)
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-4 pb-20", className)}
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
            {group.description ? <CardDescription>{group.description}</CardDescription> : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {group.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.kind === "textarea" ? (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    rows={field.rows ?? 4}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                ) : (
                  <Input
                    id={field.key}
                    name={field.key}
                    type={field.kind === "url" ? "url" : "text"}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => setField(field.key, event.target.value)}
                  />
                )}
                {field.hint ? <p className="text-xs text-muted-foreground">{field.hint}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <StickySaveBar
        dirty={dirty}
        pending={pending}
        onDiscard={() => setDraft(baseline)}
        saveLabel={saveLabel}
        discardLabel={discardLabel}
        dirtyLabel={dirtyLabel}
        cleanLabel={cleanLabel}
        pendingLabel={pendingLabel}
      />
    </form>
  )
}

export function StickySaveBar({
  dirty,
  pending = false,
  onDiscard,
  onSave,
  saveLabel = "Save changes",
  discardLabel = "Discard",
  dirtyLabel = "Unsaved changes",
  cleanLabel = "All changes saved",
  pendingLabel = "Saving…",
  className,
}: {
  dirty: boolean
  pending?: boolean
  onDiscard?: () => void
  onSave?: () => void
  saveLabel?: string
  discardLabel?: string
  dirtyLabel?: string
  cleanLabel?: string
  pendingLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-popover px-3 py-2 shadow-lg",
        className,
      )}
      role="status"
    >
      <span className="mr-auto flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className={cn("size-2 rounded-full", dirty ? "bg-foreground" : "bg-muted-foreground/40")}
        />
        <span className={dirty ? "text-foreground" : "text-muted-foreground"}>
          {dirty ? dirtyLabel : cleanLabel}
        </span>
      </span>
      <Button type="button" variant="outline" size="sm" disabled={!dirty || pending} onClick={onDiscard}>
        {discardLabel}
      </Button>
      <Button type={onSave ? "button" : "submit"} size="sm" disabled={!dirty || pending} onClick={onSave}>
        {pending ? pendingLabel : saveLabel}
      </Button>
    </div>
  )
}
