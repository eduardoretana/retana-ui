"use client"

import * as React from "react"
import { PanelRight, Pencil, Plus, Trash2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { DeskMessage, DeskOption } from "@/registry/retana/lib/inbox"
import { ChatMessage } from "@/registry/retana/ui/chat-message"
import { EntityForm } from "@/registry/retana/ui/entity-form"
import { FilterToolbar, type FilterChip } from "@/registry/retana/ui/filter-toolbar"
import { InboxList } from "@/registry/retana/ui/inbox-list"
import { ReplyComposer, type ReplySnippet } from "@/registry/retana/ui/reply-composer"
import { TicketProperties } from "@/registry/retana/ui/ticket-properties"
import type { PromptSuggestion } from "@/registry/retana/ui/prompt-suggestions"

export type TicketRecord = {
  id: string
  code: string
  subject: string
  description: string
  requester: string
  email?: string
  status: string
  priority: string
  type: string
  channel: string
  assignee: string
  due?: string
  created: string
  updated: string
  /** Preformatted opener, such as the channel and the day it arrived. */
  opened: string
  sla?: { text: string; overdue?: boolean }
  tags: string[]
  messages: DeskMessage[]
}

export type TicketDeskCopy = {
  title: string
  create: string
  search: string
  count: (count: number) => string
  empty: string
  emptyHint: string
  emptySelection: string
  properties: string
  hideProperties: string
  edit: string
  remove: string
  confirmTitle: string
  confirmBody: string
  confirm: string
  cancel: string
  reply: string
  note: string
  send: string
  sendHint: string
  seen: string
  unseen: string
  now: string
  back: string
  newTitle: string
  editTitle: string
  formDescription: string
  subject: string
  description: string
  requester: string
  email: string
  type: string
  priority: string
  channel: string
  assignee: string
  due: string
  status: string
  save: string
  filter: string
  addFilter: string
  overdue: string
  sla: string
  tags: string
  created: string
  updated: string
}

const COPY: TicketDeskCopy = {
  title: "Tickets",
  create: "New ticket",
  search: "Search tickets",
  count: (count) => `${count}`,
  empty: "No tickets",
  emptyHint: "Tickets that match the filter show up here.",
  emptySelection: "Select a ticket",
  properties: "Properties",
  hideProperties: "Hide properties",
  edit: "Edit",
  remove: "Delete",
  confirmTitle: "Delete this ticket?",
  confirmBody: "The ticket leaves this desk.",
  confirm: "Delete",
  cancel: "Cancel",
  reply: "Reply",
  note: "Note",
  send: "Send",
  sendHint: "Ctrl+Enter",
  seen: "Seen",
  unseen: "Not seen",
  now: "Now",
  back: "Back",
  newTitle: "New ticket",
  editTitle: "Edit ticket",
  formDescription: "Subject, requester, and the promise date.",
  subject: "Subject",
  description: "Description",
  requester: "Requester",
  email: "Email",
  type: "Type",
  priority: "Priority",
  channel: "Channel",
  assignee: "Assignee",
  due: "Due date",
  status: "Status",
  save: "Save",
  filter: "Status",
  addFilter: "Add filter",
  overdue: "Overdue",
  sla: "SLA",
  tags: "Tags",
  created: "Created",
  updated: "Updated",
}

export type TicketDeskProps = {
  tickets?: readonly TicketRecord[]
  defaultTickets?: readonly TicketRecord[]
  onTicketsChange?: (tickets: TicketRecord[]) => void
  agentName: string
  today: string
  locale?: string
  statuses: readonly DeskOption[]
  priorities: readonly DeskOption[]
  types: readonly DeskOption[]
  channels: readonly DeskOption[]
  assignees: readonly DeskOption[]
  suggestions?: readonly PromptSuggestion[]
  snippets?: readonly ReplySnippet[]
  emojis?: readonly string[]
  copy?: Partial<Omit<TicketDeskCopy, "count">> & { count?: TicketDeskCopy["count"] }
  className?: string
}

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

function labelOf(options: readonly DeskOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

export function TicketDesk({
  tickets: ticketsProp,
  defaultTickets = [],
  onTicketsChange,
  agentName,
  today,
  locale,
  statuses,
  priorities,
  types,
  channels,
  assignees,
  suggestions = [],
  snippets = [],
  emojis = [],
  copy,
  className,
}: TicketDeskProps) {
  const text: TicketDeskCopy = { ...COPY, ...copy, count: copy?.count ?? COPY.count }
  const [internal, setInternal] = React.useState(defaultTickets)
  const tickets = ticketsProp ?? internal
  const [selectedId, setSelectedId] = React.useState<string | null>(tickets[0]?.id ?? null)
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [panel, setPanel] = React.useState(true)
  const [form, setForm] = React.useState<TicketRecord | "new" | null>(null)
  const [confirmId, setConfirmId] = React.useState<string | null>(null)

  function commit(updater: (prev: readonly TicketRecord[]) => TicketRecord[]) {
    const next = updater(tickets)
    if (ticketsProp === undefined) setInternal(next)
    onTicketsChange?.(next)
  }

  function patch(id: string, partial: Partial<TicketRecord>) {
    commit((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial, updated: text.now } : item)))
  }

  const visible = tickets.filter((ticket) => !statusFilter || ticket.status === statusFilter)
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null
  const editing = form && form !== "new" ? form : null
  const filterChips: FilterChip[] = statusFilter
    ? [{ id: "status", label: text.filter, value: labelOf(statuses, statusFilter) }]
    : []

  return (
    <div data-slot="ticket-desk" className={cn("@container/desk relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground", className)}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{text.title}</h2>
        <Button type="button" size="sm" className="ms-auto" onClick={() => setForm("new")}>
          <Plus />
          {text.create}
        </Button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col @[62rem]/desk:flex-row">
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col @[62rem]/desk:w-80 @[62rem]/desk:flex-none", selected && "hidden @[62rem]/desk:flex")}>
          <div className="border-b border-border px-3 py-2">
            <FilterToolbar
              label={text.filter}
              filters={filterChips}
              onRemove={() => setStatusFilter(null)}
              onClearAll={() => setStatusFilter(null)}
              addFilter={{
                label: text.addFilter,
                fields: [{ id: "status", label: text.filter, options: statuses.map((status) => ({ value: status.value, label: status.label })) }],
                onAdd: (chip) => {
                  const match = statuses.find((status) => status.label === chip.value)
                  setStatusFilter(match?.value ?? null)
                },
              }}
            />
          </div>
          <InboxList
            className="min-h-0 flex-1"
            label={text.title}
            countLabel={text.count(visible.length)}
            searchLabel={text.search}
            selectedId={selectedId}
            onSelect={setSelectedId}
            emptyTitle={text.empty}
            emptyDescription={text.emptyHint}
            items={visible.map((ticket) => ({
              id: ticket.id,
              title: ticket.requester,
              subtitle: ticket.subject,
              preview: ticket.description,
              time: ticket.updated,
              meta: (
                <>
                  <Badge variant="secondary">{labelOf(statuses, ticket.status)}</Badge>
                  <span
                    data-priority={ticket.priority}
                    className={cn(
                      "size-1.5 rounded-full",
                      ticket.priority === "urgent" || ticket.priority === "high" ? "bg-destructive" : "bg-muted-foreground",
                    )}
                  />
                  <span className="text-[11px] text-muted-foreground">{labelOf(types, ticket.type)}</span>
                </>
              ),
            }))}
          />
        </div>
        <div className={cn("min-h-0 min-w-0 flex-1 flex-col border-border @[62rem]/desk:border-s", selected ? "flex" : "hidden @[62rem]/desk:flex")}>
          {selected ? (
            <>
              <header className="flex flex-wrap items-start gap-2 border-b border-border px-3 py-3">
                <Button type="button" variant="ghost" size="sm" className="@[62rem]/desk:hidden" onClick={() => setSelectedId(null)}>
                  {text.back}
                </Button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold wrap-anywhere">{selected.subject}</h2>
                  <p className="mt-1 text-xs text-muted-foreground wrap-anywhere">
                    <Badge variant="outline">{labelOf(statuses, selected.status)}</Badge>
                    <span className="ms-2">{selected.code}</span>
                    <span> · {labelOf(priorities, selected.priority)}</span>
                    <span> · {labelOf(types, selected.type)}</span>
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" aria-pressed={panel} aria-label={panel ? text.hideProperties : text.properties} onClick={() => setPanel((current) => !current)}>
                  <PanelRight />
                </Button>
                <Button type="button" variant="outline" size="icon-sm" aria-label={text.edit} onClick={() => setForm(selected)}>
                  <Pencil />
                </Button>
                <Button type="button" variant="outline" size="icon-sm" aria-label={text.remove} onClick={() => setConfirmId(selected.id)}>
                  <Trash2 />
                </Button>
              </header>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
                <p className="text-center text-[11px] text-muted-foreground">{selected.opened}</p>
                {selected.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role="user"
                    side={message.side}
                    variant={message.note ? "note" : "default"}
                    name={message.author}
                    time={message.time}
                    receipt={message.receipt}
                    noteLabel={text.note}
                    seenLabel={text.seen}
                    unseenLabel={text.unseen}
                    bubbleClassName="wrap-anywhere"
                  >
                    {message.body}
                  </ChatMessage>
                ))}
              </div>
              <div className="border-t border-border p-3">
                <ReplyComposer
                  replyLabel={text.reply}
                  noteLabel={text.note}
                  sendLabel={text.send}
                  sendHint={text.sendHint}
                  suggestions={suggestions}
                  snippets={snippets}
                  emojis={emojis}
                  onSubmit={(body, mode) => {
                    const message: DeskMessage = {
                      id: nid("m"),
                      author: agentName,
                      body,
                      time: text.now,
                      side: "outgoing",
                      note: mode === "note",
                      receipt: mode === "note" ? undefined : "unseen",
                    }
                    patch(selected.id, { messages: [...selected.messages, message] })
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground" role="status">
              {text.emptySelection}
            </div>
          )}
        </div>
        {panel && selected ? (
          <div className="absolute inset-y-0 end-0 z-10 w-full max-w-sm overflow-y-auto border-s border-border bg-background shadow-md @[72rem]/desk:static @[72rem]/desk:z-auto @[72rem]/desk:w-72 @[72rem]/desk:max-w-none @[72rem]/desk:shadow-none">
            <TicketProperties
              id={selected.id}
              title={text.properties}
              locale={locale}
              today={today}
              status={selected.status}
              statusOptions={statuses}
              onStatusChange={(status) => patch(selected.id, { status })}
              statusLabel={text.status}
              priority={selected.priority}
              priorityOptions={priorities}
              onPriorityChange={(priority) => patch(selected.id, { priority })}
              priorityLabel={text.priority}
              type={selected.type}
              typeOptions={types}
              onTypeChange={(type) => patch(selected.id, { type })}
              typeLabel={text.type}
              assignee={selected.assignee}
              assigneeOptions={assignees}
              onAssigneeChange={(assignee) => patch(selected.id, { assignee })}
              assigneeLabel={text.assignee}
              due={selected.due}
              onDueChange={(due) => patch(selected.id, { due })}
              dueLabel={text.due}
              overdueLabel={text.overdue}
              channel={labelOf(channels, selected.channel)}
              created={selected.created}
              updated={selected.updated}
              channelLabel={text.channel}
              createdLabel={text.created}
              updatedLabel={text.updated}
              sla={selected.sla}
              slaLabel={text.sla}
              tags={selected.tags}
              onTagsChange={(tags) => patch(selected.id, { tags })}
              tagsLabel={text.tags}
            />
          </div>
        ) : null}
      </div>
      <EntityForm
        key={form === "new" ? "new" : editing?.id ?? "shut"}
        open={form !== null}
        onOpenChange={(open) => {
          if (!open) setForm(null)
        }}
        title={editing ? text.editTitle : text.newTitle}
        description={text.formDescription}
        submitLabel={text.save}
        cancelLabel={text.cancel}
        onSubmit={(formData) => {
          const subject = String(formData.get("subject") ?? "").trim()
          const description = String(formData.get("description") ?? "").trim()
          const requester = String(formData.get("requester") ?? "").trim()
          if (!subject || !requester) throw new Error(text.subject)
          const next = {
            subject,
            description,
            requester,
            email: String(formData.get("email") ?? ""),
            type: String(formData.get("type") ?? types[0]?.value ?? ""),
            priority: String(formData.get("priority") ?? priorities[0]?.value ?? ""),
            channel: String(formData.get("channel") ?? channels[0]?.value ?? ""),
            assignee: String(formData.get("assignee") ?? agentName),
            due: String(formData.get("due") ?? ""),
          }
          if (editing) {
            patch(editing.id, next)
          } else {
            const created: TicketRecord = {
              id: nid("t"),
              code: `#${nid("BRU").slice(0, 8).toUpperCase()}`,
              status: statuses[0]?.value ?? "open",
              created: text.now,
              updated: text.now,
              opened: `${labelOf(channels, next.channel)} · ${text.now}`,
              tags: [],
              messages: [{ id: nid("m"), author: requester, body: description || subject, time: text.now, side: "incoming" }],
              ...next,
            }
            commit((prev) => [created, ...prev])
            setSelectedId(created.id)
          }
          setForm(null)
        }}
      >
        <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{text.subject}</span><Input name="subject" required defaultValue={editing?.subject ?? ""} /></label>
        <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{text.description}</span><Textarea name="description" defaultValue={editing?.description ?? ""} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{text.requester}</span><Input name="requester" required defaultValue={editing?.requester ?? ""} /></label>
          <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{text.email}</span><Input name="email" type="email" defaultValue={editing?.email ?? ""} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldSelect label={text.type} name="type" value={editing?.type ?? types[0]?.value} options={types} />
          <FieldSelect label={text.priority} name="priority" value={editing?.priority ?? priorities[0]?.value} options={priorities} />
          <FieldSelect label={text.channel} name="channel" value={editing?.channel ?? channels[0]?.value} options={channels} />
          <FieldSelect label={text.assignee} name="assignee" value={editing?.assignee ?? agentName} options={assignees} />
        </div>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{text.due}</span>
          <Input name="due" type="date" defaultValue={editing?.due ?? ""} />
        </label>
      </EntityForm>
      <AlertDialog open={confirmId !== null} onOpenChange={(open) => { if (!open) setConfirmId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{text.confirmBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmId) return
                commit((prev) => prev.filter((item) => item.id !== confirmId))
                if (selectedId === confirmId) setSelectedId(null)
                setConfirmId(null)
              }}
            >
              {text.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FieldSelect({
  label,
  name,
  value,
  options,
}: {
  label: string
  name: string
  value?: string
  options: readonly DeskOption[]
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="h-8 rounded-md border border-input bg-background px-2">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}
