"use client"

/**
 * An agent-written letter waiting for a person. Clean-room reading of a public
 * behavior description. No Affect source, sample data, icons, or assets were
 * copied. Sending and discarding stay with the host, including undo.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type DraftContact<TMeta = unknown> = {
  id: string
  name: string
  email: string
  meta?: TMeta
}

export type DraftTone = { id: string; label: string }

export type DraftStatus = "sent" | "discarded"

export type EmailDraftLabels = {
  title: string
  to: string
  recipients: string
  tone: string
  edit: string
  send: string
  discard: string
  undo: string
  sent: (name: string) => string
  discarded: string
  remove: string
  removeNamed: (name: string) => string
  restore: string
  attachment: string
  empty: string
  loading: string
  from: (agent: string) => string
  open: string
  message: string
}

const draftLabels: EmailDraftLabels = {
  title: "Draft",
  to: "To",
  recipients: "Recipients",
  tone: "Tone",
  edit: "Edit the message",
  send: "Send",
  discard: "Discard",
  undo: "Undo",
  sent: (name) => `Sent to ${name}`,
  discarded: "Draft discarded",
  remove: "Remove",
  removeNamed: (name) => `Remove “${name}”`,
  restore: "Put the file back",
  attachment: "Attachment",
  empty: "No draft to review.",
  loading: "Loading the draft",
  from: (agent) => `Draft by ${agent}`,
  open: "Open the order",
  message: "Message",
}

function resolveLabels(partial?: Partial<EmailDraftLabels>): EmailDraftLabels {
  return { ...draftLabels, ...partial }
}

export function EmailDraft<TMeta = unknown>({
  reference,
  account,
  amount,
  statusLabel,
  agent,
  contacts = [],
  contactId,
  onContact,
  tones = [],
  toneId,
  onTone,
  body = "",
  onBody,
  attachment,
  removedAttachment,
  onAttachment,
  linkLabel,
  onOpen,
  status = null,
  onSend,
  onDiscard,
  onUndo,
  loading = false,
  error,
  className,
  labels: labelOverrides,
}: {
  reference?: string
  account?: string
  amount?: string
  statusLabel?: string
  agent?: string
  contacts?: readonly DraftContact<TMeta>[]
  contactId?: string | null
  onContact?: (id: string) => void
  tones?: readonly DraftTone[]
  toneId?: string | null
  onTone?: (id: string) => void
  body?: string
  onBody?: (body: string) => void
  attachment?: string | null
  removedAttachment?: string | null
  onAttachment?: (name: string | null) => void
  linkLabel?: string
  onOpen?: () => void
  status?: DraftStatus | null
  onSend?: (email: { to: string; body: string; attachment: string | null }) => void
  onDiscard?: () => void
  onUndo?: () => void
  loading?: boolean
  error?: string
  className?: string
  labels?: Partial<EmailDraftLabels>
}) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const contact = contacts.find((item) => item.id === contactId) ?? contacts[0] ?? null
  const [menu, setMenu] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(body)
  const [source, setSource] = React.useState(body)
  if (source !== body) {
    setSource(body)
    setDraft(body)
  }

  function send() {
    if (!contact) return
    const next = editing ? draft : body
    if (editing) onBody?.(next)
    onSend?.({ to: contact.email, body: next, attachment: attachment ?? null })
    setEditing(false)
  }

  const quiet = !reference && contacts.length === 0 && !body

  return (
    <section aria-labelledby={titleId} aria-busy={loading || undefined} className={cn("flex w-full max-w-lg flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)}>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-36 w-full motion-reduce:animate-none" />
        </div>
      ) : error && quiet ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : quiet ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : status ? (
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={titleId} className="font-medium">
            {reference ?? labels.title}
          </h2>
          <p role="status">{status === "sent" ? labels.sent(contact?.name ?? "") : labels.discarded}</p>
          <Button type="button" size="sm" variant="outline" className="ms-auto" onClick={() => onUndo?.()}>
            {labels.undo}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <header className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-medium">
                {reference}
              </h2>
              {account ? <p className="text-xs text-muted-foreground">{account}</p> : null}
            </div>
            {statusLabel ? <Badge variant="outline">{statusLabel}</Badge> : null}
            {amount ? <p className="font-medium">{amount}</p> : null}
          </header>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{labels.to}</p>
            {contact ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={menu}
                  aria-haspopup="listbox"
                  className="w-full rounded-md border border-border px-2 py-1 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => setMenu((value) => !value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setMenu(false)
                  }}
                >
                  <span className="font-medium">{contact.name}</span>
                  <span className="mt-0.5 block text-xs break-all text-muted-foreground">{contact.email}</span>
                </button>
                {menu ? (
                  <ul role="listbox" aria-label={labels.recipients} className="mt-1 flex flex-col gap-1 rounded-md border border-border p-1">
                    {contacts.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={item.id === contact.id}
                          className="w-full rounded-md px-2 py-1 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none hover:bg-muted"
                          onClick={() => {
                            onContact?.(item.id)
                            setMenu(false)
                          }}
                        >
                          {item.name}
                          <span className="mt-0.5 block text-xs break-all text-muted-foreground">{item.email}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
          {tones.length > 0 ? (
            <div role="group" aria-label={labels.tone} className="flex flex-wrap gap-1">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  aria-pressed={tone.id === toneId}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    tone.id === toneId ? "border-ring bg-muted" : "border-border",
                  )}
                  onClick={() => onTone?.(tone.id)}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          ) : null}
          {editing ? (
            <Textarea
              aria-label={labels.message}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setEditing(false)
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault()
                  send()
                }
              }}
            />
          ) : (
            <button type="button" className="rounded-md text-start leading-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={() => setEditing(true)}>
              <span className="sr-only">{labels.edit}. </span>
              {body}
            </button>
          )}
          {linkLabel ? (
            <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => onOpen?.()}>
              {linkLabel}
            </Button>
          ) : null}
          {attachment ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border px-2 py-1">
              <span className="text-xs text-muted-foreground">{labels.attachment}</span>
              <span className="min-w-0 break-all">{attachment}</span>
              <Button type="button" size="sm" variant="outline" className="ms-auto" aria-label={labels.removeNamed(attachment)} onClick={() => onAttachment?.(null)}>
                {labels.remove}
              </Button>
            </div>
          ) : removedAttachment ? (
            <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => onAttachment?.(removedAttachment)}>
              {labels.restore}
            </Button>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {agent ? <p className="text-xs text-muted-foreground">{labels.from(agent)}</p> : null}
            <Button type="button" size="sm" className="ms-auto" onClick={send} disabled={!contact}>
              {labels.send}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onDiscard?.()}>
              {labels.discard}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
