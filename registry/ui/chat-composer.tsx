"use client"

import * as React from "react"
import { Paperclip, Send, Square, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export type ChatComposerAttachment = {
  id: string
  name: string
  size?: number
}

export type ChatComposerProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string, attachments: File[]) => void
  onStop?: () => void
  generating?: boolean
  placeholder?: string
  sendLabel?: string
  stopLabel?: string
  attachLabel?: string
  removeAttachmentLabel?: string
  /** Rendered at the start of the toolbar. Typically a model select. */
  modelSlot?: React.ReactNode
  disabled?: boolean
  accept?: string
  attachments?: ChatComposerAttachment[]
  onAttachmentsChange?: (files: File[]) => void
  className?: string
  textareaClassName?: string
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function ChatComposer({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  generating = false,
  placeholder = "Write a message",
  sendLabel = "Send",
  stopLabel = "Stop",
  attachLabel = "Attach files",
  removeAttachmentLabel = "Remove",
  modelSlot,
  disabled = false,
  accept,
  attachments,
  onAttachmentsChange,
  className,
  textareaClassName,
}: ChatComposerProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [files, setFiles] = React.useState<File[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const text = value !== undefined ? value : uncontrolled
  const locked = disabled || generating

  function setText(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  function updateFiles(next: File[]) {
    setFiles(next)
    onAttachmentsChange?.(next)
  }

  function submit() {
    const trimmed = text.trim()
    if (locked) return
    if (!trimmed && files.length === 0) return
    onSubmit?.(trimmed, files)
    if (value === undefined) setUncontrolled("")
    updateFiles([])
    if (inputRef.current) inputRef.current.value = ""
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return
    if (event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const shown: ChatComposerAttachment[] =
    attachments ??
    files.map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, name: file.name, size: file.size }))

  return (
    <form
      data-slot="chat-composer"
      data-generating={generating ? "true" : "false"}
      className={cn(
        "rounded-xl border border-border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      {shown.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-1.5" aria-label={attachLabel}>
          {shown.map((item) => (
            <li
              key={item.id}
              className="flex max-w-full items-center gap-1 rounded-md bg-muted py-0.5 pr-0.5 pl-2 text-xs"
            >
              <span className="truncate">{item.name}</span>
              {typeof item.size === "number" ? (
                <span className="shrink-0 text-muted-foreground tabular-nums">{formatBytes(item.size)}</span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`${removeAttachmentLabel} ${item.name}`}
                onClick={() => updateFiles(files.filter((file) => file.name !== item.name || file.size !== item.size))}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label={placeholder}
        className={cn(
          "max-h-40 min-h-10 resize-none border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent",
          textareaClassName,
        )}
      />
      <div className="mt-1 flex items-center gap-1">
        {modelSlot ? <div className="min-w-0">{modelSlot}</div> : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? [])
            if (picked.length) updateFiles([...files, ...picked])
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          aria-label={attachLabel}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip />
        </Button>
        {generating ? (
          <Button type="button" size="sm" variant="secondary" onClick={onStop} aria-label={stopLabel}>
            <Square />
            {stopLabel}
          </Button>
        ) : (
          <Button type="submit" size="sm" disabled={disabled || (!text.trim() && files.length === 0)} aria-label={sendLabel}>
            <Send />
            {sendLabel}
          </Button>
        )}
      </div>
    </form>
  )
}
