"use client"

/** Clean-room new-opportunity dialog. Source tabs, audio drop, and an analyze action. */

import * as React from "react"
import { Check, Info, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MagneticDropzone, type DropzoneItem } from "@/registry/retana/ui/magnetic-dropzone"
import { ProposalMotionDialog } from "@/registry/retana/ui/proposal-dialog"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"

export type OpportunitySource = "recording" | "transcript" | "notes" | "manual"

export type OpportunityChoice = { value: string; label: string }

export type OpportunityFile = { name: string; duration: string }

export type ProposalOpportunityProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  clients: readonly OpportunityChoice[]
  client?: string
  onClientChange?: (value: string) => void
  clientLabel?: string
  clientPlaceholder?: string
  types: readonly OpportunityChoice[]
  projectType?: string
  onProjectTypeChange?: (value: string) => void
  typeLabel?: string
  typePlaceholder?: string
  source?: OpportunitySource
  defaultSource?: OpportunitySource
  onSourceChange?: (source: OpportunitySource) => void
  sourceLabel?: string
  sourceOptions?: readonly { value: OpportunitySource; label: string }[]
  file?: OpportunityFile | null
  onFile?: (file: OpportunityFile | null) => void
  dropLabel?: string
  dropHint?: string
  notes?: string
  onNotesChange?: (value: string) => void
  notesLabel?: string
  notesPlaceholder?: string
  callout?: string
  cancelLabel?: string
  analyzeLabel?: string
  onAnalyze?: () => void
  closeLabel?: string
  /** Renders the form in place, for thumbnails and narrow frames. */
  inline?: boolean
  className?: string
}

const DEFAULT_SOURCES: { value: OpportunitySource; label: string }[] = [
  { value: "recording", label: "Recording" },
  { value: "transcript", label: "Transcript" },
  { value: "notes", label: "Notes" },
  { value: "manual", label: "Manual" },
]

export function ProposalOpportunity({
  open,
  onOpenChange,
  title = "New opportunity",
  description,
  clients,
  client,
  onClientChange,
  clientLabel = "Client",
  clientPlaceholder = "Choose a client",
  types,
  projectType,
  onProjectTypeChange,
  typeLabel = "Project type",
  typePlaceholder = "Choose a type",
  source,
  defaultSource = "recording",
  onSourceChange,
  sourceLabel = "Source",
  sourceOptions = DEFAULT_SOURCES,
  file,
  onFile,
  dropLabel = "Drop a recording",
  dropHint = "Audio files only",
  notes,
  onNotesChange,
  notesLabel = "Notes",
  notesPlaceholder = "What was said",
  callout = "A draft is a starting point. You still confirm scope and price.",
  cancelLabel = "Cancel",
  analyzeLabel = "Analyze",
  onAnalyze,
  closeLabel = "Close",
  inline = false,
  className,
}: ProposalOpportunityProps) {
  const [internalSource, setInternalSource] = React.useState<OpportunitySource>(defaultSource)
  const [internalNotes, setInternalNotes] = React.useState("")
  const [localFile, setLocalFile] = React.useState<OpportunityFile | null>(null)
  const activeSource = source ?? internalSource
  const activeNotes = notes ?? internalNotes
  const activeFile = file === undefined ? localFile : file
  const needsFile = activeSource === "recording"
  const canAnalyze = Boolean(client && projectType && (!needsFile || activeFile))

  const setSource = (next: string) => {
    const value = next as OpportunitySource
    if (source === undefined) setInternalSource(value)
    onSourceChange?.(value)
  }

  const acceptFile = (items: DropzoneItem[]) => {
    const done = items.find((item) => item.status === "done")
    const next = done ? { name: done.name, duration: "18:42" } : null
    if (file === undefined) setLocalFile(next)
    onFile?.(next)
  }

  const form = (
      <div data-slot="proposal-opportunity" className={cn("grid gap-4", inline && className)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="proposal-client">{clientLabel}</Label>
            <Select value={client} onValueChange={onClientChange}>
              <SelectTrigger id="proposal-client" className="w-full">
                <SelectValue placeholder={clientPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor="proposal-type">{typeLabel}</Label>
            <Select value={projectType} onValueChange={onProjectTypeChange}>
              <SelectTrigger id="proposal-type" className="w-full">
                <SelectValue placeholder={typePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {types.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium" id="proposal-source-label">
            {sourceLabel}
          </span>
          <SegmentedControl
            label={sourceLabel}
            options={sourceOptions.map((item) => ({ value: item.value, label: item.label }))}
            value={activeSource}
            onValueChange={setSource}
          />
        </div>
        {activeSource === "recording" ? (
          <div className="grid gap-2">
            <MagneticDropzone
              accept="audio/*"
              maxFiles={1}
              label={dropLabel}
              hint={dropHint}
              simulateProgress
              onItemsChange={acceptFile}
            />
            {activeFile ? (
              <div data-slot="proposal-audio-file" className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <Check className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm">{activeFile.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{activeFile.duration}</span>
              </div>
            ) : null}
          </div>
        ) : activeSource === "manual" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="proposal-manual-name">{clientLabel}</Label>
              <Input id="proposal-manual-name" value={client ? clients.find((item) => item.value === client)?.label ?? "" : ""} readOnly />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="proposal-manual-type">{typeLabel}</Label>
              <Input id="proposal-manual-type" value={projectType ? types.find((item) => item.value === projectType)?.label ?? "" : ""} readOnly />
            </div>
          </div>
        ) : (
          <div className="grid gap-1.5">
            <Label htmlFor="proposal-notes">{notesLabel}</Label>
            <Textarea
              id="proposal-notes"
              value={activeNotes}
              placeholder={notesPlaceholder}
              onChange={(event) => {
                if (notes === undefined) setInternalNotes(event.target.value)
                onNotesChange?.(event.target.value)
              }}
            />
          </div>
        )}
        <div className="flex gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>{callout}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" disabled={!canAnalyze} onClick={onAnalyze}>
            <Sparkles />
            {analyzeLabel}
          </Button>
        </div>
      </div>
  )

  if (inline) return form

  return (
    <ProposalMotionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      closeLabel={closeLabel}
      className={cn("w-[min(100%-2rem,40rem)]", className)}
    >
      {form}
    </ProposalMotionDialog>
  )
}
