"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Compone el riel, el encabezado, la lista, el hilo y la ficha.
 * El canal, la etapa y la ventana llegan por props. Nada se envía solo.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"
import type { ConversationItemData, ConversationSection, PartyPanelData, SuggestionItem, ThreadFilter, ThreadMessageData, ThreadStatus } from "@/registry/retana/lib/thread-desk"
import { AppRail, type AppRailItem } from "@/registry/retana/ui/app-rail"
import { ChatThread } from "@/registry/retana/ui/chat-thread"
import { ConversationList } from "@/registry/retana/ui/conversation-list"
import { InboxPageHeader, type InboxCrumb, type InboxHeaderAction } from "@/registry/retana/ui/inbox-page-header"
import { PartyPanel } from "@/registry/retana/ui/party-panel"
import { SuggestedReplies } from "@/registry/retana/ui/suggested-replies"
import { ThreadComposer, type ComposerLock } from "@/registry/retana/ui/thread-composer"

export type InboxLayout = "auto" | "wide" | "desk" | "tablet" | "phone"

export type InboxCrmProps = {
  layout?: InboxLayout
  railLabel?: string
  railMark?: string
  railItems?: readonly AppRailItem[]
  onRail?: (id: string) => void
  crumbs?: readonly InboxCrumb[]
  title?: string
  subtitle?: string
  actions?: readonly InboxHeaderAction[]
  bellLabel?: string
  bellCount?: number
  onBell?: () => void
  listLabel?: string
  listTitle?: string
  countLabel?: string
  searchLabel?: string
  shortcut?: string
  filters?: readonly ThreadFilter[]
  filter?: string
  onFilterChange?: (value: string) => void
  sections?: readonly ConversationSection[]
  conversations?: readonly ConversationItemData[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  threadLabel?: string
  threadTitle?: string
  threadStatus?: string
  threadPresence?: "online" | "offline" | "away"
  messages?: readonly ThreadMessageData[]
  typing?: { names: readonly string[]; label?: string }
  suggestions?: readonly SuggestionItem[]
  onSuggestion?: (id: string) => void
  onSend?: (value: string) => void
  onAsk?: () => void
  onAttach?: (files: File[]) => void
  onUseTemplate?: () => void
  locked?: ComposerLock | null
  party?: PartyPanelData
  onReveal?: (id: string) => void
  revealLabel?: string
  status?: ThreadStatus
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  offlineLabel?: string
  onRetry?: () => void
  onRetryMessage?: (id: string) => void
  retryLabel?: string
  backLabel?: string
  contextLabel?: string
  initialColumn?: "list" | "thread"
  sendLabel?: string
  askLabel?: string
  attachLabel?: string
  placeholder?: string
  className?: string
}

function readViewportLayout(): Exclude<InboxLayout, "auto"> {
  if (window.matchMedia("(max-width: 639px)").matches) return "phone"
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet"
  if (window.matchMedia("(max-width: 1279px)").matches) return "desk"
  return "wide"
}

function useAutoLayout(forced: InboxLayout) {
  const auto = useSyncExternalStore(
    (onChange) => {
      const queries = ["(max-width: 639px)", "(max-width: 1023px)", "(max-width: 1279px)"].map((query) => window.matchMedia(query))
      queries.forEach((query) => query.addEventListener("change", onChange))
      return () => queries.forEach((query) => query.removeEventListener("change", onChange))
    },
    readViewportLayout,
    () => "wide" as const,
  )
  return forced === "auto" ? auto : forced
}

export function InboxCrm({
  layout: layoutProp = "auto",
  railLabel = "Espacios",
  railMark,
  railItems = [],
  onRail,
  crumbs = [],
  title = "Mensajes",
  subtitle,
  actions = [],
  bellLabel,
  bellCount,
  onBell,
  listLabel = "Conversaciones",
  listTitle = "Mensajes",
  countLabel,
  searchLabel = "Buscar mensajes",
  shortcut = "⌘K",
  filters,
  filter,
  onFilterChange,
  sections,
  conversations = [],
  selectedId,
  onSelect,
  threadLabel = "Hilo",
  threadTitle,
  threadStatus,
  threadPresence,
  messages = [],
  typing,
  suggestions = [],
  onSuggestion,
  onSend,
  onAsk,
  onAttach,
  onUseTemplate,
  locked = null,
  party,
  onReveal,
  revealLabel = "Mostrar",
  status = "ready",
  emptyLabel = "No hay conversaciones",
  loadingLabel = "Cargando la bandeja",
  error,
  offlineLabel = "Sin conexión",
  onRetry,
  onRetryMessage,
  retryLabel = "Reintentar",
  backLabel = "Volver",
  contextLabel = "Contexto",
  initialColumn = "list",
  sendLabel = "Enviar",
  askLabel = "Preguntar a IA",
  attachLabel = "Adjuntar",
  placeholder,
  className,
}: InboxCrmProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const layout = useAutoLayout(layoutProp)
  const [column, setColumn] = useState<"list" | "thread" | "context">(initialColumn)
  const [drawer, setDrawer] = useState(false)
  const [draft, setDraft] = useState("")
  const showRail = layout === "wide" || layout === "desk"
  const showList = layout !== "phone" || column === "list"
  const showThread = layout !== "phone" || column === "thread" || column === "context"
  const showParty = layout === "wide"

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        rootRef.current?.querySelector<HTMLElement>("[data-slot=conversation-search]")?.focus()
      }
      if (event.key === "Escape") setDrawer(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function approve(id: string) {
    const item = suggestions.find((suggestion) => suggestion.id === id)
    if (item) setDraft(item.label)
    onSuggestion?.(id)
  }

  return (
    <div
      ref={rootRef}
      data-slot="inbox-crm"
      data-layout={layout}
      aria-busy={status === "loading" ? true : undefined}
      className={cn("flex min-h-[32rem] overflow-hidden rounded-2xl border border-border bg-background text-foreground", className)}
    >
      {showRail ? <AppRail label={railLabel} mark={railMark} items={railItems} onSelect={onRail} /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <InboxPageHeader crumbs={crumbs} title={title} subtitle={subtitle} actions={actions} bellLabel={bellLabel} bellCount={bellCount} onBell={onBell} />
        {status === "loading" ? (
          <div role="status" aria-label={loadingLabel} className="grid flex-1 gap-3">
            <span className="sr-only">{loadingLabel}</span>
            <span className="h-24 animate-pulse rounded-2xl bg-muted" />
            <span className="h-40 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : null}
        {status === "error" ? (
          <div role="alert" className="grid gap-3 rounded-2xl border border-border p-4">
            <p className="text-sm text-destructive">{error}</p>
            {onRetry ? (
              <button type="button" className="h-11 justify-self-start rounded-full bg-foreground px-4 text-sm text-background" onClick={onRetry}>
                {retryLabel}
              </button>
            ) : null}
          </div>
        ) : null}
        {status !== "loading" && status !== "error" ? (
          <div className={cn("grid min-h-0 flex-1 gap-4", showParty ? "xl:grid-cols-[18rem_minmax(0,1fr)_18rem]" : "md:grid-cols-[18rem_minmax(0,1fr)]")}>
            {showList ? (
              <ConversationList
                label={listLabel}
                title={listTitle}
                countLabel={countLabel}
                searchLabel={searchLabel}
                shortcut={shortcut}
                filters={filters}
                filter={filter}
                onFilterChange={onFilterChange}
                sections={sections}
                items={conversations}
                selectedId={selectedId}
                status={status === "empty" ? "empty" : "ready"}
                emptyTitle={emptyLabel}
                onSelect={(id) => {
                  onSelect?.(id)
                  setColumn("thread")
                }}
              />
            ) : null}
            {showThread ? (
              <div className="flex min-h-0 min-w-0 flex-col gap-3">
                <div className="flex items-center gap-2">
                  {layout === "phone" ? (
                    <button type="button" className="h-11 rounded-full px-3 text-sm font-medium hover:bg-muted" onClick={() => setColumn("list")}>
                      {backLabel}
                    </button>
                  ) : null}
                  {!showParty ? (
                    <button type="button" className="ms-auto h-11 rounded-full px-3 text-sm font-medium hover:bg-muted" onClick={() => setDrawer(true)}>
                      {contextLabel}
                    </button>
                  ) : null}
                </div>
                {status === "offline" ? (
                  <p role="status" className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
                    {offlineLabel}
                  </p>
                ) : null}
                <ChatThread
                  label={threadLabel}
                  title={threadTitle}
                  status={threadStatus}
                  presence={threadPresence}
                  messages={messages}
                  typing={typing}
                  onRetryMessage={onRetryMessage}
                  retryLabel={retryLabel}
                  state={status === "empty" ? "empty" : "ready"}
                  emptyLabel={emptyLabel}
                />
                {suggestions.length && !locked ? <SuggestedReplies items={suggestions} onApprove={approve} /> : null}
                <ThreadComposer
                  value={draft}
                  onValueChange={setDraft}
                  onSend={(value) => {
                    onSend?.(value)
                    setDraft("")
                  }}
                  onAsk={onAsk}
                  onAttach={onAttach}
                  onUseTemplate={onUseTemplate}
                  locked={locked}
                  offline={status === "offline"}
                  placeholder={placeholder}
                  sendLabel={sendLabel}
                  askLabel={askLabel}
                  attachLabel={attachLabel}
                />
              </div>
            ) : null}
            {showParty && party ? (
              <div className="min-w-0 border-s border-border ps-4">
                <PartyPanel {...party} presence={threadPresence} revealLabel={revealLabel} onReveal={onReveal} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {drawer && party ? (
        <div role="dialog" aria-label={contextLabel} className="fixed inset-y-0 end-0 z-40 flex w-80 max-w-full flex-col border-s border-border bg-popover p-4 shadow-none">
          <button type="button" className="mb-3 h-11 self-end rounded-full px-3 text-sm" onClick={() => setDrawer(false)}>
            {backLabel}
          </button>
          <PartyPanel {...party} presence={threadPresence} revealLabel={revealLabel} onReveal={onReveal} />
        </div>
      ) : null}
    </div>
  )
}
