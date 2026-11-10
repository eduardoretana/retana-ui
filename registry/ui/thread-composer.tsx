"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Preguntar a IA no envía. La ventana cerrada solo ofrece una plantilla.
 */

import { useRef, useState } from "react"
import { Paperclip, Send, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { AttachmentChip } from "@/registry/retana/ui/attachment-chip"

export type ComposerLock = {
  title: string
  action: string
}

export type ThreadComposerProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSend?: (value: string) => void
  onAsk?: () => void
  onAttach?: (files: File[]) => void
  onUseTemplate?: () => void
  placeholder?: string
  sendLabel?: string
  askLabel?: string
  attachLabel?: string
  locked?: ComposerLock | null
  offline?: boolean
  disabled?: boolean
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

export function ThreadComposer({
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  onAsk,
  onAttach,
  onUseTemplate,
  placeholder = "Escribe un mensaje…",
  sendLabel = "Enviar",
  askLabel = "Preguntar a IA",
  attachLabel = "Adjuntar",
  locked = null,
  offline = false,
  disabled = false,
  status = "ready",
  emptyLabel = "El compositor no está disponible",
  loadingLabel = "Cargando el compositor",
  error,
  className,
}: ThreadComposerProps) {
  const [internal, setInternal] = useState(defaultValue)
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const text = value !== undefined ? value : internal
  const blocked = Boolean(locked) || offline || disabled

  function setText(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function send() {
    const trimmed = text.trim()
    if (blocked || !trimmed) return
    onSend?.(trimmed)
    if (value === undefined) setInternal("")
    setFiles([])
  }

  if (status === "loading") return <div role="status" aria-label={loadingLabel} className="h-28 animate-pulse rounded-2xl bg-muted" />
  if (status === "error") {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (status === "empty") {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <div data-slot="thread-composer" data-locked={locked ? "true" : "false"} className={cn("grid gap-2", className)}>
      {locked ? (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-muted px-3 py-2">
          <p className="text-sm text-foreground">{locked.title}</p>
          <button type="button" className="h-11 rounded-full bg-foreground px-4 text-sm text-background" onClick={onUseTemplate}>
            {locked.action}
          </button>
        </div>
      ) : null}
      {files.length ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <AttachmentChip key={file.name} name={file.name} size={file.size} type={file.type} />
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card">
          <textarea
            value={text}
            placeholder={placeholder}
            disabled={blocked}
            rows={2}
            className="block w-full resize-none bg-transparent px-3 pt-3 text-sm caret-primary outline-none placeholder:text-muted-foreground disabled:opacity-60"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                send()
              }
            }}
          />
          <div className="flex items-center gap-1 px-2 pb-2">
            <button
              type="button"
              aria-label={attachLabel}
              disabled={blocked}
              className="grid size-11 place-items-center rounded-full text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip aria-hidden />
            </button>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              aria-hidden
              tabIndex={-1}
              onChange={(event) => {
                const next = Array.from(event.target.files ?? [])
                setFiles(next)
                onAttach?.(next)
              }}
            />
            <button
              type="button"
              disabled={blocked}
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
              onClick={onAsk}
            >
              <Sparkles className="size-3.5" aria-hidden />
              {askLabel}
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label={sendLabel}
          disabled={blocked || !text.trim()}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-40"
          onClick={send}
        >
          <Send aria-hidden />
        </button>
      </div>
    </div>
  )
}
