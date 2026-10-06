"use client"

import * as React from "react"
import { Archive, Bell, BellOff, Clock, MoreHorizontal, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DeskOption } from "@/registry/retana/lib/inbox"
import { CommentThread, type ThreadComment } from "@/registry/retana/ui/comment-thread"
import { InboxList } from "@/registry/retana/ui/inbox-list"
import { TicketProperties } from "@/registry/retana/ui/ticket-properties"

export type DeskNotification = {
  id: string
  actor: string
  summary: string
  title: string
  body: string
  time: string
  issueKey: string
  project: string
  status: string
  priority: string
  unread: boolean
  starred: boolean
  team: boolean
  snoozed: boolean
  archived: boolean
  subscribed: boolean
  banner: string
  labels: string[]
  comments: ThreadComment[]
}

export type NotificationInboxCopy = {
  title: string
  search: string
  all: string
  unread: string
  teams: string
  starred: string
  markRead: string
  more: string
  empty: string
  emptyHint: string
  emptySelection: string
  subscribe: string
  unsubscribe: string
  snooze: string
  unsnooze: string
  archive: string
  unstar: string
  star: string
  remove: string
  back: string
  activity: string
  properties: string
  status: string
  priority: string
  labels: string
  snoozed: string
}

const COPY: NotificationInboxCopy = {
  title: "Inbox",
  search: "Search notifications",
  all: "All",
  unread: "Unread",
  teams: "Teams",
  starred: "Starred",
  markRead: "Mark all read",
  more: "More",
  empty: "Nothing in this tab",
  emptyHint: "You are caught up.",
  emptySelection: "Select a notification",
  subscribe: "Subscribe",
  unsubscribe: "Unsubscribe",
  snooze: "Snooze",
  unsnooze: "Unsnooze",
  archive: "Archive",
  unstar: "Unstar",
  star: "Star",
  remove: "Delete",
  back: "Back",
  activity: "Activity",
  properties: "Properties",
  status: "Status",
  priority: "Priority",
  labels: "Labels",
  snoozed: "Snoozed",
}

const TABS = ["all", "unread", "teams", "starred"] as const
type NotificationTab = (typeof TABS)[number]

export type NotificationInboxProps = {
  notifications?: readonly DeskNotification[]
  defaultNotifications?: readonly DeskNotification[]
  onNotificationsChange?: (items: DeskNotification[]) => void
  currentUser: { id: string; name: string }
  today: string
  locale?: string
  statuses: readonly DeskOption[]
  priorities: readonly DeskOption[]
  copy?: Partial<NotificationInboxCopy>
  className?: string
}

function inTab(item: DeskNotification, tab: NotificationTab) {
  if (item.archived) return false
  if (tab === "unread") return item.unread && !item.snoozed
  if (tab === "teams") return item.team
  if (tab === "starred") return item.starred
  return true
}

export function NotificationInbox({
  notifications: notificationsProp,
  defaultNotifications = [],
  onNotificationsChange,
  currentUser,
  today,
  locale,
  statuses,
  priorities,
  copy,
  className,
}: NotificationInboxProps) {
  const text = { ...COPY, ...copy }
  const [internal, setInternal] = React.useState(defaultNotifications)
  const items = notificationsProp ?? internal
  const [tab, setTab] = React.useState<NotificationTab>("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  function commit(updater: (prev: readonly DeskNotification[]) => DeskNotification[]) {
    const next = updater(items)
    if (notificationsProp === undefined) setInternal(next)
    onNotificationsChange?.(next)
  }

  function patch(id: string, partial: Partial<DeskNotification>) {
    commit((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)))
  }

  const visible = items.filter((item) => inTab(item, tab))
  const selected = items.find((item) => item.id === selectedId && !item.archived) ?? null
  const counts: Record<NotificationTab, number> = {
    all: items.filter((item) => inTab(item, "all")).length,
    unread: items.filter((item) => inTab(item, "unread")).length,
    teams: items.filter((item) => inTab(item, "teams")).length,
    starred: items.filter((item) => inTab(item, "starred")).length,
  }
  const tabLabel: Record<NotificationTab, string> = {
    all: text.all,
    unread: text.unread,
    teams: text.teams,
    starred: text.starred,
  }

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight" ? (index + 1) % TABS.length
      : event.key === "ArrowLeft" ? (index - 1 + TABS.length) % TABS.length
      : event.key === "Home" ? 0
      : event.key === "End" ? TABS.length - 1
      : -1
    if (next < 0) return
    event.preventDefault()
    setTab(TABS[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <div data-slot="notification-inbox" className={cn("@container/desk flex h-full min-h-[28rem] overflow-hidden rounded-xl border border-border bg-background text-foreground", className)}>
      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col @[62rem]/desk:w-96 @[62rem]/desk:flex-none", selected && "hidden @[62rem]/desk:flex")}>
        <div role="tablist" aria-label={text.title} className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
          {TABS.map((value, index) => {
            const selectedTab = tab === value
            return (
              <button
                key={value}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`desk-tab-${value}`}
                aria-selected={selectedTab}
                aria-controls="desk-notification-list"
                tabIndex={selectedTab ? 0 : -1}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  selectedTab ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setTab(value)}
                onKeyDown={(event) => onTabKey(event, index)}
              >
                {tabLabel[value]}
                <span className="tabular-nums text-xs text-muted-foreground">{counts[value]}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center justify-end gap-1 border-b border-border px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => commit((prev) => prev.map((item) => (item.archived ? item : { ...item, unread: false })))}
          >
            {text.markRead}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={text.more}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setTab("unread")}>{text.unread}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTab("starred")}>{text.starred}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div id="desk-notification-list" role="tabpanel" aria-labelledby={`desk-tab-${tab}`} className="min-h-0 flex-1">
          <InboxList
            className="h-full"
            label={text.title}
            searchLabel={text.search}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              patch(id, { unread: false })
            }}
            emptyTitle={text.empty}
            emptyDescription={text.emptyHint}
            items={visible.map((item) => ({
              id: item.id,
              title: item.actor,
              subtitle: item.summary,
              preview: `${item.issueKey} · ${item.project}`,
              time: item.time,
              unread: item.unread ? 1 : 0,
              meta: (
                <>
                  <span className={cn("size-1.5 rounded-full", item.unread ? "bg-primary" : "bg-muted-foreground")} />
                  <span className="text-[11px] text-muted-foreground">{item.issueKey}</span>
                  {item.snoozed ? <span className="text-[11px] text-muted-foreground">{text.snoozed}</span> : null}
                  {item.starred ? <Star className="size-3 text-foreground" aria-hidden /> : null}
                </>
              ),
            }))}
          />
        </div>
      </div>
      <div className={cn("min-h-0 min-w-0 flex-1 @[62rem]/desk:flex", selected ? "flex" : "hidden")}>
        {selected ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col @[72rem]/desk:flex-row">
            <article className="flex min-h-0 min-w-0 flex-1 flex-col">
              <header className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
                <Button type="button" variant="ghost" size="sm" className="@[62rem]/desk:hidden" onClick={() => setSelectedId(null)}>
                  {text.back}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={selected.subscribed}
                  aria-label={selected.subscribed ? text.unsubscribe : text.subscribe}
                  onClick={() => patch(selected.id, { subscribed: !selected.subscribed })}
                >
                  {selected.subscribed ? <Bell /> : <BellOff />}
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-pressed={selected.snoozed} aria-label={selected.snoozed ? text.unsnooze : text.snooze} onClick={() => patch(selected.id, { snoozed: !selected.snoozed })}>
                  <Clock />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={text.archive} onClick={() => { patch(selected.id, { archived: true }); setSelectedId(null) }}>
                  <Archive />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={text.more}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => patch(selected.id, { starred: !selected.starred })}>
                      {selected.starred ? text.unstar : text.star}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => patch(selected.id, { subscribed: !selected.subscribed })}>
                      {selected.subscribed ? text.unsubscribe : text.subscribe}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => patch(selected.id, { snoozed: false })}>{text.unsnooze}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => { patch(selected.id, { archived: true }); setSelectedId(null) }}>{text.archive}</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => { commit((prev) => prev.filter((item) => item.id !== selected.id)); setSelectedId(null) }}>{text.remove}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground wrap-anywhere">{selected.banner}</p>
                <h2 className="mt-4 text-lg font-semibold wrap-anywhere">{selected.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground wrap-anywhere">{selected.body}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {selected.labels.map((label) => (
                    <Badge key={label} variant="secondary">{label}</Badge>
                  ))}
                </div>
                <div className="mt-6">
                  <CommentThread
                    title={text.activity}
                    currentUser={currentUser}
                    comments={selected.comments}
                    onCommentsChange={(comments) => patch(selected.id, { comments })}
                  />
                </div>
                {selected.subscribed ? null : (
                  <p className="mt-3 text-xs text-muted-foreground">{text.unsubscribe}</p>
                )}
              </div>
            </article>
            <div className="min-h-0 w-full overflow-y-auto border-t border-border @[72rem]/desk:w-72 @[72rem]/desk:border-s @[72rem]/desk:border-t-0">
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
                tags={selected.labels}
                onTagsChange={(labels) => patch(selected.id, { labels })}
                tagsLabel={text.labels}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground" role="status">
            {text.emptySelection}
          </div>
        )}
      </div>
    </div>
  )
}
