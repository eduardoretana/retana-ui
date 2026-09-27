"use client"

import * as React from "react"
import { ImagePlus, LayoutGrid, List, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MediaAsset } from "@/registry/retana/lib/admin-types"
import { formatBytes, formatWhen } from "@/registry/retana/lib/format"
import { ConfirmDelete, EmptyState } from "@/registry/retana/ui/entity-form"

function isVideo(mime: string, url: string) {
  return mime.startsWith("video/") || /\.(mp4|webm|mov)($|\?)/i.test(url)
}

function matchesAccept(file: File, accept: string) {
  const rules = accept.split(",").map((rule) => rule.trim()).filter(Boolean)
  if (rules.length === 0) return true
  const name = file.name.toLowerCase()
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule.toLowerCase())
    if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1))
    return file.type === rule
  })
}

export type MediaFieldProps = {
  label: string
  value: string
  onChange: (value: string, asset?: MediaAsset | null) => void
  assets: readonly MediaAsset[]
  onUpload: (file: File) => Promise<MediaAsset>
  onBusyChange?: (busy: boolean) => void
  accept?: string
  hint?: string
  className?: string
  pickLabel?: string
  clearLabel?: string
  uploadLabel?: string
  uploadingLabel?: string
  dropLabel?: string
  emptyLibrary?: string
  uploadedMessage?: string
  uploadFailed?: string
  typeError?: string
}

export function MediaField({
  label,
  value,
  onChange,
  assets,
  onUpload,
  onBusyChange,
  accept = "image/*,video/mp4,video/webm",
  hint,
  className,
  pickLabel = "Library",
  clearLabel = "Remove",
  uploadLabel = "Upload",
  uploadingLabel = "Uploading…",
  dropLabel = "Drop a file",
  emptyLibrary = "Library is empty",
  uploadedMessage = "Uploaded",
  uploadFailed = "Upload failed",
  typeError = "That file type is not allowed.",
}: MediaFieldProps) {
  const inputId = React.useId()
  const [busy, setBusy] = React.useState(false)
  const activeUploads = React.useRef(0)
  const [dragging, setDragging] = React.useState(false)
  const [libraryOpen, setLibraryOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    onBusyChange?.(busy)
  }, [busy, onBusyChange])

  React.useEffect(() => {
    const form = rootRef.current?.closest("form")
    if (!form) return
    const block = (event: Event) => {
      if (!busy) return
      event.preventDefault()
      event.stopPropagation()
    }
    form.addEventListener("submit", block, true)
    return () => form.removeEventListener("submit", block, true)
  }, [busy])

  async function take(file: File | undefined) {
    if (!file) return
    if (!matchesAccept(file, accept)) {
      toast.error(typeError)
      return
    }
    activeUploads.current += 1
    setBusy(true)
    try {
      const asset = await onUpload(file)
      onChange(asset.url, asset)
      toast.success(uploadedMessage)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : uploadFailed)
    } finally {
      activeUploads.current = Math.max(0, activeUploads.current - 1)
      if (activeUploads.current === 0) setBusy(false)
    }
  }

  const preview = value
  const video = preview ? isVideo("", preview) : false

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-2", className)} data-uploading={busy || undefined}>
      <span className="text-sm font-medium">{label}</span>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-3",
          dragging && "bg-accent",
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void take(event.dataTransfer.files[0])
        }}
      >
        {preview ? (
          video ? (
            <video src={preview} className="max-h-40 rounded-lg bg-background" controls muted />
          ) : (
            // Host URLs and blob previews. next/image is not available in a registry item.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-40 rounded-lg object-contain" />
          )
        ) : (
          <div className="grid h-24 place-items-center text-sm text-muted-foreground">
            <ImagePlus className="mb-1 size-5" />
            {busy ? uploadingLabel : dropLabel}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              void take(event.target.files?.[0])
              event.target.value = ""
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload />
            {uploadLabel}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setLibraryOpen(true)}>
            {pickLabel}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("", null)}>
              {clearLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{pickLabel}</DialogTitle>
          </DialogHeader>
          {assets.length === 0 ? (
            <EmptyState title={emptyLibrary} />
          ) : (
            <ul className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {assets.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    className="block w-full overflow-hidden rounded-lg ring-1 ring-foreground/10 hover:bg-muted"
                    onClick={() => {
                      onChange(asset.url, asset)
                      setLibraryOpen(false)
                    }}
                  >
                    <MediaPreview asset={asset} />
                    <span className="block truncate px-1 py-1 text-left text-xs">{asset.filename}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export type MediaLibraryProps = {
  assets: readonly MediaAsset[]
  onUpload: (file: File) => Promise<MediaAsset>
  onDelete: (id: string) => Promise<void> | void
  className?: string
  uploadLabel?: string
  uploadingLabel?: string
  dropLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  uploadedMessage?: string
  uploadFailed?: string
  nameLabel?: string
  typeLabel?: string
  sizeLabel?: string
  addedLabel?: string
  deleteTitle?: string
  deleteDescription?: string
  deleteLabel?: string
  viewLabel?: string
  accept?: string
  typeError?: string
}

type SortKey = "createdAt" | "filename" | "size"

export function MediaLibrary({
  assets,
  onUpload,
  onDelete,
  className,
  uploadLabel = "Upload",
  uploadingLabel = "Uploading…",
  dropLabel = "Drop a file",
  emptyTitle = "No files yet",
  emptyDescription = "Upload an image or a video.",
  uploadedMessage = "Uploaded",
  uploadFailed = "Upload failed",
  nameLabel = "Name",
  typeLabel = "Type",
  sizeLabel = "Size",
  addedLabel = "Added",
  deleteTitle = "Delete file",
  deleteDescription = "The file is removed from the library.",
  deleteLabel = "Delete",
  viewLabel = "View",
  accept = "image/*,video/mp4,video/webm",
  typeError = "That file type is not allowed.",
}: MediaLibraryProps) {
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const activeUploads = React.useRef(0)
  const [sort, setSort] = React.useState<SortKey>("createdAt")
  const [dir, setDir] = React.useState<"asc" | "desc">("desc")
  const [busy, setBusy] = React.useState(false)
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const sorted = React.useMemo(() => {
    const copy = assets.slice()
    copy.sort((a, b) => {
      const factor = dir === "asc" ? 1 : -1
      if (sort === "filename") return a.filename.localeCompare(b.filename) * factor
      if (sort === "size") return (a.size - b.size) * factor
      return a.createdAt.localeCompare(b.createdAt) * factor
    })
    return copy
  }, [assets, dir, sort])

  async function take(file: File | undefined) {
    if (!file) return
    if (!matchesAccept(file, accept)) {
      toast.error(typeError)
      return
    }
    activeUploads.current += 1
    setBusy(true)
    try {
      await onUpload(file)
      toast.success(uploadedMessage)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : uploadFailed)
    } finally {
      activeUploads.current = Math.max(0, activeUploads.current - 1)
      if (activeUploads.current === 0) setBusy(false)
    }
  }

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((current) => (current === "asc" ? "desc" : "asc"))
    else {
      setSort(key)
      setDir(key === "filename" ? "asc" : "desc")
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload />
          {busy ? uploadingLabel : uploadLabel}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            void take(event.target.files?.[0])
            event.target.value = ""
          }}
        />
        <div
          className="flex min-h-9 flex-1 items-center justify-center rounded-lg border border-dashed border-border px-3 text-xs text-muted-foreground"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            void take(event.dataTransfer.files[0])
          }}
        >
          {dropLabel}
        </div>
        <div className="flex rounded-lg bg-muted p-0.5" role="group" aria-label={viewLabel}>
          <Button type="button" size="icon-sm" variant={view === "grid" ? "secondary" : "ghost"} aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            <LayoutGrid />
          </Button>
          <Button type="button" size="icon-sm" variant={view === "table" ? "secondary" : "ghost"} aria-pressed={view === "table"} onClick={() => setView("table")}>
            <List />
          </Button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : view === "grid" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((asset) => (
            <li key={asset.id} className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              <MediaPreview asset={asset} />
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{asset.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(asset.size)}</p>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`${deleteLabel} ${asset.filename}`} onClick={() => setPendingId(asset.id)}>
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("filename")}>{nameLabel}</button>
                </TableHead>
                <TableHead>{typeLabel}</TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("size")}>{sizeLabel}</button>
                </TableHead>
                <TableHead>
                  <button type="button" onClick={() => toggleSort("createdAt")}>{addedLabel}</button>
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="max-w-48 truncate">{asset.filename}</TableCell>
                  <TableCell>{asset.mime}</TableCell>
                  <TableCell>{formatBytes(asset.size)}</TableCell>
                  <TableCell>{formatWhen(Date.parse(asset.createdAt))}</TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`${deleteLabel} ${asset.filename}`} onClick={() => setPendingId(asset.id)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmDelete
        open={pendingId != null}
        onOpenChange={(open) => {
          if (!open) setPendingId(null)
        }}
        title={deleteTitle}
        description={deleteDescription}
        onConfirm={async () => {
          if (pendingId) await onDelete(pendingId)
          setPendingId(null)
        }}
      />
    </div>
  )
}

function MediaPreview({ asset }: { asset: MediaAsset }) {
  if (isVideo(asset.mime, asset.url)) {
    return <video src={asset.url} className="aspect-video w-full bg-muted object-cover" muted playsInline />
  }
  if (!asset.url) {
    return <div className="grid aspect-video place-items-center bg-muted text-xs text-muted-foreground">File</div>
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset.url} alt="" className="aspect-video w-full bg-muted object-cover" />
}
