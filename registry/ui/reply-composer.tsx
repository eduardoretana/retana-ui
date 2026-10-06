"use client"

import * as React from "react"
import { Paperclip, Send, Smile, TextQuote, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { PromptSuggestions, type PromptSuggestion } from "@/registry/retana/ui/prompt-suggestions"

export type ReplyComposerMode = "reply" | "note"

export type ReplySnippet = {
  id: string
  label: string
  body: string
}

export type ReplyComposerClassNames = {
  root?: string
  tabs?: string
  suggestions?: string
  field?: string
  toolbar?: string
}

export type ReplyComposerProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  mode?: ReplyComposerMode
  defaultMode?: ReplyComposerMode
  onModeChange?: (mode: ReplyComposerMode) => void
  onSubmit?: (value: string, mode: ReplyComposerMode, attachments: File[]) => void
  suggestions?: readonly PromptSuggestion[]
  noteSuggestions?: readonly PromptSuggestion[]
  onSuggestionSelect?: (value: string) => void
  snippets?: readonly ReplySnippet[]
  emojis?: readonly string[]
  /** Replaces the built-in emoji button. */
  emojiSlot?: React.ReactNode
  /** Replaces the built-in snippet button. */
  snippetSlot?: React.ReactNode
  /** Replaces the attach button. */
  attachSlot?: React.ReactNode
  placeholder?: string
  notePlaceholder?: string
  replyLabel?: string
  noteLabel?: string
  sendLabel?: string
  attachLabel?: string
  emojiLabel?: string
  snippetLabel?: string
  suggestionsLabel?: string
  removeAttachmentLabel?: string
  /** Shown beside send. Both Ctrl+Enter and ⌘+Enter submit either way. */
  sendHint?: string
  disabled?: boolean
  accept?: string
  className?: string
  classNames?: ReplyComposerClassNames
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function ReplyComposer({
  value,
  defaultValue = "",
  onValueChange,
  mode: modeProp,
  defaultMode = "reply",
  onModeChange,
  onSubmit,
  suggestions = [],
  noteSuggestions = [],
  onSuggestionSelect,
  snippets = [],
  emojis = [],
  emojiSlot,
  snippetSlot,
  attachSlot,
  placeholder = "Write a reply",
  notePlaceholder = "Write an internal note",
  replyLabel = "Reply",
  noteLabel = "Note",
  sendLabel = "Send",
  attachLabel = "Attach a file",
  emojiLabel = "Insert emoji",
  snippetLabel = "Insert a snippet",
  suggestionsLabel = "Suggested replies",
  removeAttachmentLabel = "Remove",
  sendHint = "Ctrl+Enter",
  disabled = false,
  accept,
  className,
  classNames,
}: ReplyComposerProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [modeState, setModeState] = React.useState<ReplyComposerMode>(defaultMode)
  const [files, setFiles] = React.useState<File[]>([])
  const fileRef = React.useRef<HTMLInputElement>(null)
  const areaRef = React.useRef<HTMLTextAreaElement>(null)
  const text = value !== undefined ? value : uncontrolled
  const mode = modeProp ?? modeState
  const note = mode === "note"
  const hintId = React.useId()
  const replyTabId = React.useId()
  const noteTabId = React.useId()
  const panelId = React.useId()
  const chips = note ? noteSuggestions : suggestions

  function setText(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  function setMode(next: ReplyComposerMode) {
    if (modeProp === undefined) setModeState(next)
    onModeChange?.(next)
  }

  function insert(chunk: string) {
    const node = areaRef.current
    const start = node?.selectionStart ?? text.length
    const end = node?.selectionEnd ?? text.length
    const next = `${text.slice(0, start)}${chunk}${text.slice(end)}`
    setText(next)
    const caret = start + chunk.length
    requestAnimationFrame(() => {
      node?.focus()
      node?.setSelectionRange(caret, caret)
    })
  }

  function submit() {
    const trimmed = text.trim()
    if (disabled) return
    if (!trimmed && files.length === 0) return
    onSubmit?.(trimmed, mode, files)
    if (value === undefined) setUncontrolled("")
    setFiles([])
    if (fileRef.current) fileRef.current.value = ""
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return
    if (!event.metaKey && !event.ctrlKey) return
    event.preventDefault()
    submit()
  }

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const next = mode === "reply" ? "note" : "reply"
    setMode(next)
    document.getElementById(next === "reply" ? replyTabId : noteTabId)?.focus()
  }

  return (
    <form
      data-slot="reply-composer"
      data-mode={mode}
      className={cn(
        "rounded-xl border border-border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40",
        note && "bg-accent text-accent-foreground",
        className,
        classNames?.root,
      )}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div role="tablist" aria-label={replyLabel} className={cn("mb-2 flex gap-1", classNames?.tabs)}>
        {(
          [
            { id: replyTabId, value: "reply" as const, label: replyLabel },
            { id: noteTabId, value: "note" as const, label: noteLabel },
          ]
        ).map((tab) => {
          const selected = mode === tab.value
          return (
            <button
              key={tab.value}
              id={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60",
              )}
              onClick={() => setMode(tab.value)}
              onKeyDown={onTabKeyDown}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={note ? noteTabId : replyTabId}>
        {chips.length > 0 ? (
          <PromptSuggestions
            items={[...chips]}
            label={suggestionsLabel}
            onSelect={(next) => {
              if (onSuggestionSelect) onSuggestionSelect(next)
              else setText(next)
            }}
            className={cn("mb-2", classNames?.suggestions)}
          />
        ) : null}
        {files.length > 0 ? (
          <ul className="mb-2 flex flex-wrap gap-1.5" aria-label={attachLabel}>
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex max-w-full items-center gap-1 rounded-md bg-background/80 py-0.5 pr-0.5 pl-2 text-xs text-foreground"
              >
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">{formatBytes(file.size)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${removeAttachmentLabel} ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <Textarea
          ref={areaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={note ? notePlaceholder : placeholder}
          disabled={disabled}
          rows={3}
          aria-label={note ? notePlaceholder : placeholder}
          aria-describedby={hintId}
          className={cn(
            "max-h-40 min-h-16 resize-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent",
            classNames?.field,
          )}
        />
      </div>
      <div className={cn("mt-1 flex items-center gap-1", classNames?.toolbar)}>
        {attachSlot ?? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                const picked = Array.from(event.target.files ?? [])
                if (picked.length) setFiles((current) => [...current, ...picked])
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={attachLabel}
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip />
            </Button>
          </>
        )}
        {emojiSlot ?? (emojis.length > 0 ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={emojiLabel} disabled={disabled}>
                <Smile />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <div className="flex max-w-56 flex-wrap gap-1" role="list" aria-label={emojiLabel}>
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    role="listitem"
                    className="rounded-md px-1.5 py-1 text-base hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => insert(emoji)}
                  >
                    <span aria-hidden>{emoji}</span>
                    <span className="sr-only">{emoji}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : null)}
        {snippetSlot ?? (snippets.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={snippetLabel} disabled={disabled}>
                <TextQuote />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {snippets.map((snippet) => (
                <DropdownMenuItem key={snippet.id} onSelect={() => insert(snippet.body)}>
                  {snippet.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null)}
        <p id={hintId} className="ml-auto text-[11px] text-muted-foreground">
          {sendHint}
        </p>
        <Button type="submit" size="sm" disabled={disabled || (!text.trim() && files.length === 0)} aria-label={sendLabel}>
          <Send />
          {sendLabel}
        </Button>
      </div>
    </form>
  )
}
