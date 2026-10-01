"use client"

import * as React from "react"
import { FileUp, RotateCcw, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type DropzoneItem = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "done" | "error"
  error?: string
  retryable?: boolean
}

export type MagneticDropzoneProps = {
  accept?: string
  maxSize?: number
  maxFiles?: number
  items?: readonly DropzoneItem[]
  onItemsChange?: (items: DropzoneItem[]) => void
  onFiles?: (files: File[]) => void
  /** Uploads each accepted file. Progress is 0–100. Reject to mark the row failed. Removing the row aborts the signal. */
  onUpload?: (file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<void>
  simulateProgress?: boolean
  label?: string
  hint?: string
  removeLabel?: string
  retryLabel?: string
  tooLargeLabel?: string
  typeLabel?: string
  className?: string
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function matchesAccept(file: File, accept: string | undefined) {
  if (!accept) return true
  const rules = accept.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean)
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule)
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

export function MagneticDropzone({
  accept,
  maxSize = 8 * 1024 * 1024,
  maxFiles = 8,
  items,
  onItemsChange,
  onFiles,
  onUpload,
  simulateProgress = false,
  label = "Drop files here",
  hint = "or choose them from your computer",
  removeLabel = "Remove",
  retryLabel = "Retry",
  tooLargeLabel = "File is too large",
  typeLabel = "File type is not allowed",
  className,
}: MagneticDropzoneProps) {
  const [local, setLocal] = React.useState<DropzoneItem[]>([])
  const [over, setOver] = React.useState(false)
  const [pull, setPull] = React.useState({ x: 0, y: 0 })
  const inputRef = React.useRef<HTMLInputElement>(null)
  const depth = React.useRef(0)
  const list = items ?? local
  const listRef = React.useRef(list)
  const filesRef = React.useRef(new Map<string, File>())
  const uploadsRef = React.useRef(new Map<string, AbortController>())

  React.useEffect(() => {
    listRef.current = list
  }, [list])

  function commit(next: DropzoneItem[]) {
    listRef.current = next
    if (items === undefined) setLocal(next)
    onItemsChange?.(next)
  }

  function patchItem(id: string, update: (item: DropzoneItem) => DropzoneItem) {
    commit(listRef.current.map((item) => (item.id === id ? update(item) : item)))
  }

  function startUpload(id: string, file: File) {
    if (!onUpload) return
    uploadsRef.current.get(id)?.abort()
    const controller = new AbortController()
    uploadsRef.current.set(id, controller)
    patchItem(id, (item) => ({ ...item, status: "uploading", progress: 0, error: undefined }))
    void onUpload(file, {
      signal: controller.signal,
      onProgress: (percent) => {
        patchItem(id, (item) => ({ ...item, progress: Math.max(0, Math.min(100, percent)) }))
      },
    })
      .then(() => {
        if (controller.signal.aborted) return
        patchItem(id, (item) => ({ ...item, status: "done", progress: 100, error: undefined }))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error && error.message ? error.message : "Upload failed"
        patchItem(id, (item) => ({ ...item, status: "error", error: message }))
      })
  }

  function ingest(files: File[]) {
    const room = Math.max(0, maxFiles - list.length)
    const accepted: File[] = []
    const next = list.slice()
    for (const file of files.slice(0, room)) {
      const id = `${file.name}-${file.size}-${file.lastModified}-${next.length}`
      if (!matchesAccept(file, accept)) {
        next.push({ id, name: file.name, size: file.size, type: file.type, progress: 0, status: "error", error: typeLabel })
        continue
      }
      if (file.size > maxSize) {
        next.push({ id, name: file.name, size: file.size, type: file.type, progress: 0, status: "error", error: tooLargeLabel })
        continue
      }
      accepted.push(file)
      filesRef.current.set(id, file)
      next.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: onUpload || simulateProgress ? 8 : 100,
        status: onUpload || simulateProgress ? "uploading" : "done",
        retryable: Boolean(onUpload),
      })
    }
    commit(next)
    if (accepted.length) onFiles?.(accepted)
    if (onUpload) {
      for (const file of accepted) {
        const match = next.find((item) => filesRef.current.get(item.id) === file && item.status === "uploading")
        if (match) startUpload(match.id, file)
      }
    }
  }

  React.useEffect(() => {
    if (!simulateProgress || onUpload) return
    const id = window.setInterval(() => {
      const current = listRef.current
      if (!current.some((item) => item.status === "uploading")) return
      const next = current.map((item) => {
        if (item.status !== "uploading") return item
        const progress = Math.min(100, item.progress + 14)
        return {
          ...item,
          progress,
          status: progress >= 100 ? "done" : "uploading",
        } as DropzoneItem
      })
      if (items === undefined) setLocal(next)
      onItemsChange?.(next)
    }, 280)
    return () => window.clearInterval(id)
  }, [items, onItemsChange, onUpload, simulateProgress])

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    const strength = over ? 18 : 10
    setPull({ x: x * strength, y: y * strength })
  }

  return (
    <div data-slot="magnetic-dropzone" className={cn("flex flex-col gap-3", className)}>
      <div
        onPointerMove={onPointerMove}
        onPointerLeave={() => setPull({ x: 0, y: 0 })}
        onDragEnter={(event) => {
          event.preventDefault()
          depth.current += 1
          setOver(true)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => {
          depth.current = Math.max(0, depth.current - 1)
          if (depth.current === 0) setOver(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          depth.current = 0
          setOver(false)
          ingest(Array.from(event.dataTransfer.files))
        }}
        className="rounded-xl"
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          data-over={over ? "true" : "false"}
          className={cn(
            "flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center transition-transform duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            over && "scale-[1.02] border-primary bg-primary/5",
          )}
          style={{ transform: `translate(${pull.x}px, ${pull.y}px)${over ? " scale(1.02)" : ""}` }}
        >
          <FileUp className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(event) => {
            ingest(Array.from(event.target.files ?? []))
            event.target.value = ""
          }}
        />
      </div>
      {list.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {list.map((item) => (
            <li key={item.id} data-status={item.status} className="rounded-lg border border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {item.error ?? formatBytes(item.size)}
                  </p>
                </div>
                {item.status === "error" && item.retryable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`${retryLabel} ${item.name}`}
                    onClick={() => {
                      const file = filesRef.current.get(item.id)
                      if (file) startUpload(item.id, file)
                    }}
                  >
                    <RotateCcw />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${removeLabel} ${item.name}`}
                  onClick={() => {
                    uploadsRef.current.get(item.id)?.abort()
                    uploadsRef.current.delete(item.id)
                    filesRef.current.delete(item.id)
                    commit(list.filter((entry) => entry.id !== item.id))
                  }}
                >
                  <X />
                </Button>
              </div>
              {item.status !== "error" ? (
                <div
                  className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.progress}
                  aria-label={item.name}
                >
                  <div
                    className={cn("h-full rounded-full", item.status === "done" ? "bg-primary" : "bg-foreground/70")}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
