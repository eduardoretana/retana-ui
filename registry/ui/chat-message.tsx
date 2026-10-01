"use client"

import * as React from "react"
import { AlertCircle, Check, Copy, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type ChatRole = "user" | "assistant" | "system"
export type ChatMessageStatus = "sending" | "sent" | "error"

export type ChatMessageProps = {
  role: ChatRole
  children: React.ReactNode
  /** Shown above the bubble. Defaults to a role label. */
  name?: string
  /** Preformatted time. The host owns locale and timezone. */
  time?: string
  avatar?: React.ReactNode
  status?: ChatMessageStatus
  reactions?: readonly { emoji: string; count: number; mine?: boolean }[]
  onReact?: (emoji: string) => void
  /** Plain text passed to the copy action. Falls back to string children. */
  copyText?: string
  onRetry?: () => void
  onRegenerate?: () => void
  onCopy?: (text: string) => void
  sendingLabel?: string
  errorLabel?: string
  retryLabel?: string
  copyLabel?: string
  copiedLabel?: string
  regenerateLabel?: string
  className?: string
  bubbleClassName?: string
  actionsClassName?: string
}

const ROLE_LABEL: Record<ChatRole, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
}

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(textFromChildren).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return textFromChildren(children.props.children)
  }
  return ""
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
  return (
    <span
      aria-hidden
      className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground"
    >
      {letters || "?"}
    </span>
  )
}

export function ChatMessage({
  role,
  children,
  name,
  time,
  avatar,
  status = "sent",
  reactions,
  onReact,
  copyText,
  onRetry,
  onRegenerate,
  onCopy,
  sendingLabel = "Sending",
  errorLabel = "Not sent",
  retryLabel = "Retry",
  copyLabel = "Copy",
  copiedLabel = "Copied",
  regenerateLabel = "Regenerate",
  className,
  bubbleClassName,
  actionsClassName,
}: ChatMessageProps) {
  const label = name ?? ROLE_LABEL[role]
  const [copied, setCopied] = React.useState(false)
  const copiedTimer = React.useRef<number>(0)
  const mine = role === "user"
  const system = role === "system"

  React.useEffect(() => () => window.clearTimeout(copiedTimer.current), [])

  async function copy() {
    const text = copyText ?? textFromChildren(children)
    try {
      await navigator.clipboard.writeText(text)
      onCopy?.(text)
      setCopied(true)
      window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const showActions = !system && status !== "sending" && (role === "assistant" || status === "error")

  return (
    <article
      data-slot="chat-message"
      data-role={role}
      data-status={status}
      aria-busy={status === "sending" || undefined}
      className={cn(
        "flex w-full gap-2",
        system && "justify-center",
        mine && "flex-row-reverse",
        className,
      )}
    >
      {system ? null : avatar ?? <Initials name={label} />}
      <div className={cn("flex min-w-0 max-w-[min(100%,36rem)] flex-col gap-1", mine && "items-end")}>
        {system ? null : (
          <div className={cn("flex items-baseline gap-2 px-1", mine && "flex-row-reverse")}>
            <span className="text-xs font-medium">{label}</span>
            {time ? <time className="text-[11px] text-muted-foreground tabular-nums">{time}</time> : null}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed wrap-break-word",
            system && "bg-transparent px-0 text-center text-xs text-muted-foreground",
            mine && "rounded-ee-md bg-primary text-primary-foreground",
            role === "assistant" && "rounded-es-md bg-muted text-foreground",
            status === "sending" && "opacity-70",
            status === "error" && "ring-1 ring-destructive/50",
            bubbleClassName,
          )}
        >
          {children}
        </div>
        {reactions?.length ? (
          <div className="flex flex-wrap gap-1 px-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                aria-pressed={reaction.mine || undefined}
                aria-label={`${reaction.emoji}, ${reaction.count}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs",
                  reaction.mine && "border-primary bg-primary/10",
                )}
                onClick={() => onReact?.(reaction.emoji)}
              >
                <span aria-hidden>{reaction.emoji}</span>
                <span className="tabular-nums">{reaction.count}</span>
                <span className="sr-only">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        ) : null}
        {status === "sending" ? (
          <p className="px-1 text-[11px] text-muted-foreground">{sendingLabel}</p>
        ) : null}
        {status === "error" ? (
          <p className="flex items-center gap-1 px-1 text-[11px] text-destructive">
            <AlertCircle className="size-3" aria-hidden />
            {errorLabel}
          </p>
        ) : null}
        {showActions ? (
          <div className={cn("flex items-center gap-0.5", actionsClassName)}>
            {status === "error" && onRetry ? (
              <Button type="button" variant="ghost" size="xs" onClick={onRetry}>
                <RotateCcw />
                {retryLabel}
              </Button>
            ) : null}
            {role === "assistant" && status !== "error" ? (
              <>
                <Button type="button" variant="ghost" size="xs" onClick={() => void copy()} aria-label={copied ? copiedLabel : copyLabel}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? copiedLabel : copyLabel}
                </Button>
                {onRegenerate ? (
                  <Button type="button" variant="ghost" size="xs" onClick={onRegenerate}>
                    <RotateCcw />
                    {regenerateLabel}
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
