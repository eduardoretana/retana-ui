"use client"

import * as React from "react"
import {
  AtSign,
  Ban,
  Clock,
  Flag,
  Inbox,
  Layers,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Pencil,
  SquarePen,
  Star,
  UserRound,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { DeskMessage, DeskOption, DeskPresence } from "@/registry/retana/lib/inbox"
import { ChatMessage } from "@/registry/retana/ui/chat-message"
import { ContactPanel, type ContactSection } from "@/registry/retana/ui/contact-panel"
import { EntityForm } from "@/registry/retana/ui/entity-form"
import { InboxList } from "@/registry/retana/ui/inbox-list"
import { ReplyComposer, type ReplySnippet } from "@/registry/retana/ui/reply-composer"
import { TagInput } from "@/registry/retana/ui/tag-input"
import type { PromptSuggestion } from "@/registry/retana/ui/prompt-suggestions"

const ICONS = {
  inbox: Inbox,
  "at-sign": AtSign,
  pencil: Pencil,
  layers: Layers,
  user: UserRound,
  ban: Ban,
  star: Star,
  flag: Flag,
  clock: Clock,
  users: Users,
} as const

export type SupportFolderIcon = keyof typeof ICONS

export type SupportFolder = {
  id: string
  label: string
  section: "folders" | "views" | "teams"
  icon: SupportFolderIcon
}

export type SupportConversation = {
  id: string
  name: string
  email?: string
  company?: string
  location?: string
  presence?: DeskPresence
  subject: string
  preview: string
  time: string
  unread?: number
  assignee?: string
  team?: string
  priority?: string
  status?: string
  channel?: string
  starred?: boolean
  snoozed?: boolean
  spam?: boolean
  closed?: boolean
  mentions?: boolean
  createdByMe?: boolean
  tags?: string[]
  attributes?: readonly { label: string; value: string }[]
  messages: DeskMessage[]
}

export type SupportInboxCopy = {
  title: string
  compose: string
  search: string
  folders: string
  views: string
  teams: string
  emptyFolder: string
  emptyFolderHint: string
  emptySelection: string
  emptySelectionHint: string
  open: (count: number) => string
  sortActivity: string
  sortUnread: string
  collapse: string
  expand: string
  star: string
  unstar: string
  snooze: string
  unsnooze: string
  more: string
  unassign: string
  spam: string
  details: string
  hideDetails: string
  close: string
  back: string
  reply: string
  note: string
  send: string
  sendHint: string
  seen: string
  unseen: string
  now: string
  newTitle: string
  newDescription: string
  name: string
  company: string
  channel: string
  email: string
  subject: string
  message: string
  save: string
  cancel: string
  viewContact: string
  online: string
  offline: string
  away: string
  assignee: string
  team: string
  priority: string
  status: string
  lead: string
  attributes: string
  tags: string
  none: string
  folderLabel: string
}

const COPY: SupportInboxCopy = {
  title: "Inbox",
  compose: "New conversation",
  search: "Search conversations",
  folders: "Folders",
  views: "Views",
  teams: "Team inboxes",
  emptyFolder: "This folder is empty",
  emptyFolderHint: "New conversations will show up here.",
  emptySelection: "Select a conversation",
  emptySelectionHint: "The thread opens in this pane.",
  open: (count) => `${count} open`,
  sortActivity: "Last activity",
  sortUnread: "Unread first",
  collapse: "Hide folders",
  expand: "Show folders",
  star: "Star",
  unstar: "Unstar",
  snooze: "Snooze",
  unsnooze: "Unsnooze",
  more: "More actions",
  unassign: "Unassign",
  spam: "Mark as spam",
  details: "Details",
  hideDetails: "Hide details",
  close: "Close",
  back: "Back to the list",
  reply: "Reply",
  note: "Note",
  send: "Send",
  sendHint: "Ctrl+Enter",
  seen: "Seen",
  unseen: "Not seen",
  now: "Now",
  newTitle: "New conversation",
  newDescription: "Start a conversation with someone outside the team.",
  name: "Name",
  company: "Company",
  channel: "Channel",
  email: "Email",
  subject: "Subject",
  message: "Message",
  save: "Create",
  cancel: "Cancel",
  viewContact: "View contact",
  online: "Online",
  offline: "Offline",
  away: "Away",
  assignee: "Assignee",
  team: "Team inbox",
  priority: "Priority",
  status: "Status",
  lead: "Lead data",
  attributes: "Conversation attributes",
  tags: "Tags",
  none: "None",
  folderLabel: "Folder",
}

export type SupportInboxProps = {
  folders: readonly SupportFolder[]
  conversations?: readonly SupportConversation[]
  defaultConversations?: readonly SupportConversation[]
  onConversationsChange?: (items: SupportConversation[]) => void
  agentName: string
  channels?: readonly DeskOption[]
  assignees?: readonly DeskOption[]
  teams?: readonly DeskOption[]
  priorities?: readonly DeskOption[]
  statuses?: readonly DeskOption[]
  suggestions?: readonly PromptSuggestion[]
  snippets?: readonly ReplySnippet[]
  emojis?: readonly string[]
  copilot?: React.ReactNode
  copy?: Partial<Omit<SupportInboxCopy, "open">> & { open?: SupportInboxCopy["open"] }
  className?: string
}

function matchesFolder(item: SupportConversation, folderId: string, agentName: string) {
  if (item.spam) return folderId === "spam"
  if (folderId === "spam") return false
  if (item.closed && folderId !== "all" && folderId !== "created") return false
  switch (folderId) {
    case "inbox":
      return !item.snoozed && (!item.assignee || item.assignee === agentName)
    case "mentions":
      return Boolean(item.mentions)
    case "created":
      return Boolean(item.createdByMe)
    case "all":
      return true
    case "unassigned":
      return !item.assignee
    case "starred":
      return Boolean(item.starred)
    case "priority":
      return item.priority === "high" || item.priority === "urgent"
    case "snoozed":
      return Boolean(item.snoozed)
    default:
      return item.team === folderId
  }
}

function nid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export function SupportInbox({
  folders,
  conversations: conversationsProp,
  defaultConversations = [],
  onConversationsChange,
  agentName,
  channels = [],
  assignees = [],
  teams = [],
  priorities = [],
  statuses = [],
  suggestions = [],
  snippets = [],
  emojis = [],
  copilot,
  copy,
  className,
}: SupportInboxProps) {
  const text: SupportInboxCopy = { ...COPY, ...copy, open: copy?.open ?? COPY.open }
  const [internal, setInternal] = React.useState(defaultConversations)
  const items = conversationsProp ?? internal
  const [folderId, setFolderId] = React.useState(folders[0]?.id ?? "inbox")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [collapsed, setCollapsed] = React.useState(false)
  const [details, setDetails] = React.useState(true)
  const [sort, setSort] = React.useState<"activity" | "unread">("activity")
  const [creating, setCreating] = React.useState(false)
  const leadId = React.useId()

  function commit(updater: (prev: readonly SupportConversation[]) => SupportConversation[]) {
    const next = updater(items)
    if (conversationsProp === undefined) setInternal(next)
    onConversationsChange?.(next)
  }

  function patch(id: string, partial: Partial<SupportConversation>) {
    commit((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)))
  }

  const inFolder = items.filter((item) => matchesFolder(item, folderId, agentName))
  const sorted = sort === "unread"
    ? inFolder.slice().sort((a, b) => Number(Boolean(b.unread)) - Number(Boolean(a.unread)))
    : inFolder
  const selected = items.find((item) => item.id === selectedId) ?? null
  const openCount = sorted.filter((item) => !item.closed).length

  const sections: ContactSection[] = selected
    ? [
        {
          id: "lead",
          title: text.lead,
          defaultOpen: true,
          content: (
            <dl id={leadId} className="grid gap-1 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{text.name}</dt><dd className="wrap-anywhere text-end">{selected.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{text.email}</dt><dd className="wrap-anywhere text-end">{selected.email || text.none}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">{text.company}</dt><dd className="wrap-anywhere text-end">{selected.company || text.none}</dd></div>
            </dl>
          ),
        },
        {
          id: "attributes",
          title: text.attributes,
          content: (
            <dl className="grid gap-1">
              {(selected.attributes ?? []).map((row) => (
                <div key={row.label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="wrap-anywhere text-end">{row.value}</dd>
                </div>
              ))}
            </dl>
          ),
        },
        {
          id: "tags",
          title: text.tags,
          content: (
            <TagInput
              label={text.tags}
              value={selected.tags ?? []}
              onValueChange={(tags) => patch(selected.id, { tags })}
            />
          ),
        },
      ]
    : []

  const withNone = (options: readonly DeskOption[]) => [{ value: "", label: text.none }, ...options]

  return (
    <div
      data-slot="support-inbox"
      className={cn("@container/desk relative flex h-full min-h-[28rem] overflow-hidden rounded-xl border border-border bg-background text-foreground", className)}
    >
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "hidden min-h-0 shrink-0 flex-col border-e border-border bg-muted/40 @[52rem]/desk:flex",
          collapsed ? "w-12" : "w-52",
        )}
      >
        <div className="p-2">
          <Button type="button" size={collapsed ? "icon-sm" : "sm"} className={cn(!collapsed && "w-full")} aria-label={text.compose} onClick={() => setCreating(true)}>
            <SquarePen />
            {collapsed ? null : <span className="truncate">{text.compose}</span>}
          </Button>
        </div>
        <nav aria-label={text.folders} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 pb-3">
          {(["folders", "views", "teams"] as const).map((section) => {
            const group = folders.filter((folder) => folder.section === section)
            if (!group.length) return null
            const heading = section === "folders" ? text.folders : section === "views" ? text.views : text.teams
            return (
              <div key={section} className="grid gap-0.5">
                <p className={cn("px-2 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase", collapsed && "sr-only")}>{heading}</p>
                {group.map((folder) => {
                  const Icon = ICONS[folder.icon]
                  const count = items.filter((item) => matchesFolder(item, folder.id, agentName)).length
                  const active = folder.id === folderId
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      aria-current={active ? "page" : undefined}
                      aria-label={folder.label}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        active ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                      )}
                      onClick={() => {
                        setFolderId(folder.id)
                        setSelectedId(null)
                      }}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className={cn("truncate", collapsed && "sr-only")}>{folder.label}</span>
                      <span className={cn("ms-auto text-xs tabular-nums", collapsed && "sr-only")}>{count}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col @[52rem]/desk:flex-row">
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col @[52rem]/desk:w-80 @[52rem]/desk:flex-none", selected && "hidden @[52rem]/desk:flex")}>
          <label className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs @[52rem]/desk:hidden">
            <span className="text-muted-foreground">{text.folderLabel}</span>
            <select
              aria-label={text.folderLabel}
              value={folderId}
              onChange={(event) => {
                setFolderId(event.target.value)
                setSelectedId(null)
              }}
              className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2"
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.label}</option>
              ))}
            </select>
          </label>
          <InboxList
            className="min-h-0 flex-1"
            label={text.title}
            title={text.title}
            countLabel={text.open(openCount)}
            searchLabel={text.search}
            items={sorted.map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: item.subject,
              preview: item.preview,
              time: item.time,
              unread: item.unread,
              presence: item.presence,
            }))}
            selectedId={selectedId}
            onSelect={setSelectedId}
            emptyTitle={text.emptyFolder}
            emptyDescription={text.emptyFolderHint}
            toolbar={
              <>
                <Button type="button" variant="outline" size="sm" className="hidden @[52rem]/desk:inline-flex" aria-pressed={sort === "unread"} onClick={() => setSort((current) => (current === "activity" ? "unread" : "activity"))}>
                  {sort === "activity" ? text.sortActivity : text.sortUnread}
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" className="hidden @[52rem]/desk:inline-flex" aria-pressed={collapsed} aria-label={collapsed ? text.expand : text.collapse} onClick={() => setCollapsed((current) => !current)}>
                  {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
              </>
            }
          />
        </div>
        <div className={cn("min-h-0 min-w-0 flex-1 flex-col", selected ? "flex" : "hidden @[52rem]/desk:flex")}>
          {selected ? (
            <>
              <header className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Button type="button" variant="ghost" size="sm" className="@[52rem]/desk:hidden" onClick={() => setSelectedId(null)}>
                  {text.back}
                </Button>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">{selected.presence === "online" ? text.online : selected.presence === "away" ? text.away : text.offline}</p>
                </div>
                <div className="ms-auto flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" aria-pressed={Boolean(selected.starred)} aria-label={selected.starred ? text.unstar : text.star} onClick={() => patch(selected.id, { starred: !selected.starred })}>
                    <Star />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-pressed={Boolean(selected.snoozed)} aria-label={selected.snoozed ? text.unsnooze : text.snooze} onClick={() => patch(selected.id, { snoozed: !selected.snoozed })}>
                    <Clock />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={text.more}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => patch(selected.id, { assignee: "" })}>{text.unassign}</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => patch(selected.id, { spam: true, closed: false })}>{text.spam}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button type="button" variant="ghost" size="icon-sm" aria-pressed={details} aria-label={details ? text.hideDetails : text.details} onClick={() => setDetails((current) => !current)}>
                    <PanelRight />
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => patch(selected.id, { closed: true, unread: 0 })}>
                    {text.close}
                  </Button>
                </div>
              </header>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
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
                    patch(selected.id, {
                      messages: [...selected.messages, message],
                      preview: body,
                      time: text.now,
                      unread: 0,
                    })
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center" role="status">
              <p className="text-sm font-medium">{text.emptySelection}</p>
              <p className="text-xs text-muted-foreground">{text.emptySelectionHint}</p>
            </div>
          )}
        </div>
      </div>
      {details && selected ? (
        <div className="absolute inset-0 z-10 flex min-h-0 flex-col bg-background @[72rem]/desk:static @[72rem]/desk:z-auto @[72rem]/desk:w-80 @[72rem]/desk:border-s @[72rem]/desk:border-border">
          <Button type="button" variant="ghost" size="sm" className="m-2 self-start @[72rem]/desk:hidden" onClick={() => setDetails(false)}>
            {text.back}
          </Button>
          <ContactPanel
            className="min-h-0 flex-1"
            contactName={selected.name}
            presence={selected.presence}
            presenceLabel={selected.presence === "online" ? text.online : selected.presence === "away" ? text.away : text.offline}
            viewContactLabel={text.viewContact}
            onViewContact={() => document.getElementById(leadId)?.scrollIntoView({ block: "nearest" })}
            spamLabel={text.spam}
            onMarkSpam={() => patch(selected.id, { spam: true })}
            fields={[
              { id: "assignee", label: text.assignee, value: selected.assignee ?? "", options: withNone(assignees), onChange: (assignee) => patch(selected.id, { assignee }) },
              { id: "team", label: text.team, value: selected.team ?? "", options: withNone(teams), onChange: (team) => patch(selected.id, { team }) },
              { id: "priority", label: text.priority, value: selected.priority ?? "", options: priorities, onChange: (priority) => patch(selected.id, { priority }) },
              { id: "status", label: text.status, value: selected.status ?? "", options: statuses, onChange: (status) => patch(selected.id, { status }) },
            ]}
            sections={sections}
            copilot={copilot}
          />
        </div>
      ) : null}
      <EntityForm
        key={creating ? "open" : "closed"}
        open={creating}
        onOpenChange={setCreating}
        title={text.newTitle}
        description={text.newDescription}
        submitLabel={text.save}
        cancelLabel={text.cancel}
        onSubmit={(formData) => {
          const name = String(formData.get("name") ?? "").trim()
          const subject = String(formData.get("subject") ?? "").trim()
          const message = String(formData.get("message") ?? "").trim()
          if (!name || !subject || !message) throw new Error(text.subject)
          const created: SupportConversation = {
            id: nid("c"),
            name,
            email: String(formData.get("email") ?? ""),
            channel: String(formData.get("channel") ?? ""),
            subject,
            preview: message,
            time: text.now,
            assignee: agentName,
            createdByMe: true,
            presence: "offline",
            status: statuses[0]?.value,
            priority: priorities[0]?.value,
            unread: 1,
            messages: [{ id: nid("m"), author: name, body: message, time: text.now, side: "incoming" }],
          }
          commit((prev) => [created, ...prev])
          setFolderId("created")
          setSelectedId(created.id)
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{text.name}</span>
          <Input name="name" required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{text.channel}</span>
          <select name="channel" className="h-8 rounded-md border border-input bg-background px-2" defaultValue={channels[0]?.value ?? ""}>
            {channels.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{text.email}</span>
          <Input name="email" type="email" />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{text.subject}</span>
          <Input name="subject" required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">{text.message}</span>
          <Textarea name="message" required />
        </label>
      </EntityForm>
    </div>
  )
}
