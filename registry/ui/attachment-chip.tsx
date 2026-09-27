"use client"

import * as React from "react"
import { File, FileArchive, FileAudio, FileImage, FileText, FileVideo, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type AttachmentChipProps = {
  name: string
  size?: number
  type?: string
  previewUrl?: string
  href?: string
  onRemove?: () => void
  removeLabel?: string
  className?: string
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function fileKind(type: string | undefined, name: string) {
  const mime = (type ?? "").toLowerCase()
  const extension = name.split(".").pop()?.toLowerCase() ?? ""
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) return "image" as const
  if (mime.startsWith("video/") || ["mp4", "webm", "mov"].includes(extension)) return "video" as const
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(extension)) return "audio" as const
  if (mime.includes("zip") || ["zip", "rar", "7z"].includes(extension)) return "archive" as const
  if (mime.includes("text") || mime.includes("pdf") || ["pdf", "txt", "md", "doc", "docx"].includes(extension)) return "text" as const
  return "file" as const
}

function FileGlyph({ type, name }: { type?: string; name: string }) {
  const kind = fileKind(type, name)
  const className = "size-4"
  if (kind === "image") return <FileImage className={className} aria-hidden />
  if (kind === "video") return <FileVideo className={className} aria-hidden />
  if (kind === "audio") return <FileAudio className={className} aria-hidden />
  if (kind === "archive") return <FileArchive className={className} aria-hidden />
  if (kind === "text") return <FileText className={className} aria-hidden />
  return <File className={className} aria-hidden />
}

export function AttachmentChip({
  name,
  size,
  type,
  previewUrl,
  href,
  onRemove,
  removeLabel = "Remove",
  className,
}: AttachmentChipProps) {
  const showPreview = Boolean(previewUrl) && (type ?? "").startsWith("image/")
  const body = (
    <>
      {showPreview && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="size-8 rounded-md object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
          <FileGlyph type={type} name={name} />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm">{name}</span>
        {typeof size === "number" ? (
          <span className="block text-[11px] text-muted-foreground tabular-nums">{formatBytes(size)}</span>
        ) : null}
      </span>
    </>
  )

  return (
    <span
      data-slot="attachment-chip"
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-card py-1 pr-1 pl-1.5",
        className,
      )}
    >
      {href ? (
        <a href={href} className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {body}
        </a>
      ) : (
        <span className="flex min-w-0 items-center gap-2">{body}</span>
      )}
      {onRemove ? (
        <Button type="button" variant="ghost" size="icon-xs" aria-label={`${removeLabel} ${name}`} onClick={onRemove}>
          <X />
        </Button>
      ) : null}
    </span>
  )
}
