"use client"

/**
 * Clean-room behavior. Visual inspiration only — no premium source,
 * class names, colors, or icons were copied.
 */

import * as React from "react"
import { Bug, Check, CircleHelp, FileText, Loader2, Monitor, Paperclip, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type BugReportType = {
  value: string
  label: string
}

export type BugReportPriorityTone = "muted" | "primary" | "destructive"

export type BugReportPriority = {
  value: string
  label: string
  tone?: BugReportPriorityTone
}

export type BugReportValues = {
  title: string
  description: string
  type: string
  priority: string
  environment: string
}

export type BugReport = BugReportValues & {
  files: File[]
}

export type BugReportLabels = {
  title: string
  subtitle: string
  titleField: string
  titlePlaceholder: string
  descriptionField: string
  descriptionPlaceholder: string
  typeField: string
  priorityField: string
  environmentField: string
  environmentPlaceholder: string
  detectEnvironment: string
  attach: string
  attachHint: string
  removeFile: string
  submit: string
  submitting: string
  success: string
  successDetail: string
  error: string
  retry: string
  titleError: string
  descriptionError: string
  typeError: string
  fileTypeError: string
  fileSizeError: string
  fileCountError: string
}

export type BugReportStatus = "idle" | "submitting" | "success" | "error"

export type BugReportFieldErrors = {
  title?: string
  description?: string
  type?: string
}

export const defaultBugTypes: BugReportType[] = [
  { value: "ui", label: "UI issue" },
  { value: "functionality", label: "Functionality" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
]

export const defaultBugPriorities: BugReportPriority[] = [
  { value: "low", label: "Low", tone: "muted" },
  { value: "medium", label: "Medium", tone: "primary" },
  { value: "high", label: "High", tone: "destructive" },
]

export const defaultBugReportLabels: BugReportLabels = {
  title: "Report a bug",
  subtitle: "Help us improve your experience",
  titleField: "Title",
  titlePlaceholder: "What went wrong?",
  descriptionField: "Description",
  descriptionPlaceholder: "Describe the issue…",
  typeField: "Bug type",
  priorityField: "Priority",
  environmentField: "Environment",
  environmentPlaceholder: "Chrome, Windows 11",
  detectEnvironment: "Detect",
  attach: "Attach screenshot",
  attachHint: "(JPG, PNG, max {max}MB)",
  removeFile: "Remove",
  submit: "Submit bug",
  submitting: "Sending…",
  success: "Sent!",
  successDetail: "Thanks — we received your report.",
  error: "Couldn't send the report. Try again.",
  retry: "Try again",
  titleError: "Add a short title.",
  descriptionError: "Describe what happened.",
  typeError: "Choose a bug type.",
  fileTypeError: "That file type is not allowed.",
  fileSizeError: "File must be {max} MB or smaller.",
  fileCountError: "You can attach up to {max} files.",
}

const priorityToneClass: Record<BugReportPriorityTone, { dot: string; selected: string }> = {
  muted: {
    dot: "bg-muted-foreground",
    selected: "border-foreground/30 bg-muted text-foreground hover:bg-muted",
  },
  primary: {
    dot: "bg-primary",
    selected: "border-primary bg-primary/10 text-foreground hover:bg-primary/10",
  },
  destructive: {
    dot: "bg-destructive",
    selected: "border-destructive bg-destructive/10 text-foreground hover:bg-destructive/10",
  },
}

type Attachment = {
  id: string
  file: File
  url: string
}

export type UseBugReportFormOptions = {
  onSubmit?: (report: BugReport) => Promise<void> | void
  types?: BugReportType[]
  priorities?: BugReportPriority[]
  labels?: Partial<BugReportLabels>
  defaultValues?: Partial<BugReportValues>
  values?: BugReportValues
  onValuesChange?: (values: BugReportValues) => void
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
  autoDetectEnvironment?: boolean
  resetAfterSuccessMs?: number
  disabled?: boolean
}

function fillTemplate(template: string, max: number) {
  return template.replaceAll("{max}", String(max))
}

function matchesAccept(file: File, accept: string) {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
  if (!rules.length) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule)
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `file-${Math.random().toString(36).slice(2)}`
}

function createObjectUrl(file: File) {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return ""
  try {
    return URL.createObjectURL(file)
  } catch {
    return ""
  }
}

function revokeObjectUrl(url: string) {
  if (!url || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return
  try {
    URL.revokeObjectURL(url)
  } catch {
    // The preview URL may already be gone.
  }
}

export function detectBugEnvironment() {
  if (typeof navigator === "undefined") return ""
  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        brands?: { brand: string; version: string }[]
        platform?: string
      }
    }
  ).userAgentData
  if (uaData?.brands?.length) {
    const brands = uaData.brands.filter((brand) => !/not.?a.?brand/i.test(brand.brand))
    const specific = brands.find((brand) => !/chromium/i.test(brand.brand)) ?? brands[0]
    const browser = specific ? `${specific.brand} ${specific.version}`.trim() : ""
    return [browser, uaData.platform].filter(Boolean).join(", ")
  }
  return navigator.userAgent.replace(/\s+/g, " ").trim().slice(0, 120)
}

function emptyValues(priorities: BugReportPriority[], defaults?: Partial<BugReportValues>): BugReportValues {
  const medium = priorities.some((item) => item.value === "medium") ? "medium" : (priorities[0]?.value ?? "")
  return {
    title: defaults?.title ?? "",
    description: defaults?.description ?? "",
    type: defaults?.type ?? "",
    priority: defaults?.priority ?? medium,
    environment: defaults?.environment ?? "",
  }
}

export function useBugReportForm({
  onSubmit,
  types = defaultBugTypes,
  priorities = defaultBugPriorities,
  labels: labelOverrides,
  defaultValues,
  values: controlledValues,
  onValuesChange,
  accept = "image/jpeg,image/png,.jpg,.jpeg,.png",
  maxSizeMB = 5,
  maxFiles = 1,
  autoDetectEnvironment = false,
  resetAfterSuccessMs,
  disabled = false,
}: UseBugReportFormOptions = {}) {
  const labels = React.useMemo(() => ({ ...defaultBugReportLabels, ...labelOverrides }), [labelOverrides])
  const [internal, setInternal] = React.useState<BugReportValues>(() => emptyValues(priorities, defaultValues))
  const values = controlledValues ?? internal
  const [files, setFiles] = React.useState<Attachment[]>([])
  const [errors, setErrors] = React.useState<BugReportFieldErrors>({})
  const [fileError, setFileError] = React.useState("")
  const [status, setStatus] = React.useState<BugReportStatus>("idle")
  const filesRef = React.useRef(files)
  const resetTimer = React.useRef<number | null>(null)
  const detectedOnce = React.useRef(false)

  React.useEffect(() => {
    filesRef.current = files
  }, [files])

  React.useEffect(() => {
    return () => {
      for (const file of filesRef.current) revokeObjectUrl(file.url)
      if (resetTimer.current != null) window.clearTimeout(resetTimer.current)
    }
  }, [])

  const setValues = React.useCallback(
    (next: BugReportValues) => {
      if (!controlledValues) setInternal(next)
      onValuesChange?.(next)
    },
    [controlledValues, onValuesChange],
  )

  const setField = React.useCallback(
    <K extends keyof BugReportValues>(key: K, value: BugReportValues[K]) => {
      const source = controlledValues ?? null
      if (source) {
        setValues({ ...source, [key]: value })
        return
      }
      setInternal((current) => {
        const next = { ...current, [key]: value }
        onValuesChange?.(next)
        return next
      })
    },
    [controlledValues, onValuesChange, setValues],
  )

  const applyDetectedEnvironment = React.useCallback(() => {
    const detected = detectBugEnvironment()
    if (detected) setField("environment", detected)
  }, [setField])

  React.useEffect(() => {
    if (!autoDetectEnvironment || detectedOnce.current) return
    const timer = window.setTimeout(() => {
      detectedOnce.current = true
      const detected = detectBugEnvironment()
      if (!detected) return
      if (controlledValues) {
        if (!controlledValues.environment.trim()) onValuesChange?.({ ...controlledValues, environment: detected })
        return
      }
      setInternal((current) => {
        if (current.environment.trim()) return current
        const next = { ...current, environment: detected }
        onValuesChange?.(next)
        return next
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [autoDetectEnvironment, controlledValues, onValuesChange])

  function clearFiles(list: Attachment[]) {
    for (const file of list) revokeObjectUrl(file.url)
  }

  const reset = React.useCallback(() => {
    if (resetTimer.current != null) window.clearTimeout(resetTimer.current)
    clearFiles(filesRef.current)
    filesRef.current = []
    setFiles([])
    setErrors({})
    setFileError("")
    setStatus("idle")
    setValues(emptyValues(priorities, defaultValues))
  }, [defaultValues, priorities, setValues])

  function addFiles(incoming: File[]) {
    if (disabled || !incoming.length || status === "submitting") return
    const next = [...filesRef.current]
    let message = ""
    for (const file of incoming) {
      if (next.length >= maxFiles) {
        message = fillTemplate(labels.fileCountError, maxFiles)
        break
      }
      if (!matchesAccept(file, accept)) {
        message = labels.fileTypeError
        continue
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        message = fillTemplate(labels.fileSizeError, maxSizeMB)
        continue
      }
      next.push({ id: createId(), file, url: createObjectUrl(file) })
    }
    if (next.length !== filesRef.current.length) {
      filesRef.current = next
      setFiles(next)
    }
    setFileError(message)
    if (status === "error" || status === "success") setStatus("idle")
  }

  function removeFile(id: string) {
    const target = filesRef.current.find((file) => file.id === id)
    if (target) revokeObjectUrl(target.url)
    const next = filesRef.current.filter((file) => file.id !== id)
    filesRef.current = next
    setFiles(next)
    setFileError("")
  }

  function validate(current: BugReportValues): BugReportFieldErrors {
    const next: BugReportFieldErrors = {}
    if (!current.title.trim()) next.title = labels.titleError
    if (!current.description.trim()) next.description = labels.descriptionError
    if (!current.type) next.type = labels.typeError
    return next
  }

  async function submit(event?: React.FormEvent) {
    event?.preventDefault()
    if (disabled || status === "submitting") return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus("idle")
      return
    }
    setStatus("submitting")
    try {
      await onSubmit?.({ ...values, files: filesRef.current.map((file) => file.file) })
      setStatus("success")
      if (resetAfterSuccessMs != null) {
        if (resetTimer.current != null) window.clearTimeout(resetTimer.current)
        resetTimer.current = window.setTimeout(() => reset(), resetAfterSuccessMs)
      }
    } catch {
      setStatus("error")
    }
  }

  return {
    accept,
    addFiles,
    applyDetectedEnvironment,
    autoDetectEnvironment,
    disabled,
    errors,
    fileError,
    files,
    labels,
    maxFiles,
    maxSizeMB,
    priorities,
    removeFile,
    reset,
    setErrors,
    setField,
    setStatus,
    status,
    submit,
    types,
    values,
  }
}

export type BugReportFormApi = ReturnType<typeof useBugReportForm>

type ChipOption = { value: string; label: string }

function ChipRadioGroup({
  label,
  labelId,
  value,
  options,
  onChange,
  describedBy,
  invalid,
  disabled,
  renderOption,
  chipClassName,
  optionAttribute,
}: {
  label: string
  labelId: string
  value: string
  options: ChipOption[]
  onChange: (value: string) => void
  describedBy?: string
  invalid?: boolean
  disabled?: boolean
  renderOption?: (option: ChipOption, selected: boolean) => React.ReactNode
  chipClassName?: (option: ChipOption, selected: boolean) => string
  optionAttribute?: (option: ChipOption) => Record<string, string>
}) {
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const selectedIndex = options.findIndex((option) => option.value === value)
  const tabValue = selectedIndex >= 0 ? options[selectedIndex].value : options[0]?.value

  function move(from: string, direction: 1 | -1 | "start" | "end") {
    const index = options.findIndex((option) => option.value === from)
    const nextIndex =
      direction === "start" ? 0 : direction === "end" ? options.length - 1 : (index + direction + options.length) % options.length
    const next = options[nextIndex]
    if (!next) return
    onChange(next.value)
    refs.current.get(next.value)?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="text-sm font-medium">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              tabIndex={option.value === tabValue ? 0 : -1}
              ref={(node) => {
                if (node) refs.current.set(option.value, node)
                else refs.current.delete(option.value)
              }}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault()
                  move(option.value, 1)
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault()
                  move(option.value, -1)
                } else if (event.key === "Home") {
                  event.preventDefault()
                  move(option.value, "start")
                } else if (event.key === "End") {
                  event.preventDefault()
                  move(option.value, "end")
                }
              }}
              className={cn("h-9 rounded-full px-3 font-normal", chipClassName?.(option, selected))}
              {...optionAttribute?.(option)}
            >
              {renderOption ? renderOption(option, selected) : option.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  )
}

function CheckMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden transition-[width,opacity] duration-200 motion-reduce:transition-none",
        selected ? "w-3.5 opacity-100" : "w-0 opacity-0",
      )}
    >
      <Check className="size-3.5" />
    </span>
  )
}

export type BugReportFormProps = UseBugReportFormOptions & {
  className?: string
  form?: BugReportFormApi
}

export function BugReportForm({ className, form, ...options }: BugReportFormProps) {
  const internal = useBugReportForm(form ? {} : options)
  const api = form ?? internal
  const {
    accept,
    addFiles,
    applyDetectedEnvironment,
    autoDetectEnvironment,
    disabled,
    errors,
    fileError,
    files,
    labels,
    maxFiles,
    maxSizeMB,
    priorities,
    removeFile,
    setErrors,
    setField,
    status,
    submit,
    types,
    values,
  } = api
  const uid = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  const dragDepth = React.useRef(0)
  const titleId = `${uid}-title`
  const descriptionId = `${uid}-description`
  const environmentId = `${uid}-environment`
  const titleErrorId = `${uid}-title-error`
  const descriptionErrorId = `${uid}-description-error`
  const typeErrorId = `${uid}-type-error`
  const fileErrorId = `${uid}-file-error`
  const fileHintId = `${uid}-file-hint`
  const typeLabelId = `${uid}-type-label`
  const priorityLabelId = `${uid}-priority-label`
  const headingId = `${uid}-heading`
  const busy = status === "submitting"
  const hint = fillTemplate(labels.attachHint, maxSizeMB)
  const showDropzone = files.length < maxFiles

  function edit<K extends keyof BugReportValues>(key: K, value: BugReportValues[K]) {
    setField(key, value)
    if (key === "title" || key === "description" || key === "type") {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
    if (status === "error" || status === "success") api.setStatus("idle")
  }

  function onPaste(event: React.ClipboardEvent) {
    const images = [...event.clipboardData.files]
    if (!images.length) return
    event.preventDefault()
    addFiles(images)
  }

  const statusText = status === "submitting" ? labels.submitting : status === "success" ? labels.success : status === "error" ? labels.error : ""

  return (
    <form
      noValidate
      data-slot="bug-report-form"
      data-status={status}
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
      onSubmit={submit}
      onPaste={onPaste}
      className={cn("w-full min-w-0", className)}
    >
      <Card className="overflow-visible shadow-sm">
        <CardHeader className="flex-row items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
            <Bug className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="text-base font-semibold tracking-tight text-pretty">
              {labels.title}
            </h2>
            <p className="text-sm text-muted-foreground text-pretty">{labels.subtitle}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleId} className="sr-only">
              {labels.titleField}
            </Label>
            <div className="relative">
              <CircleHelp className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id={titleId}
                name="title"
                value={values.title}
                placeholder={labels.titlePlaceholder}
                disabled={disabled || busy}
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? titleErrorId : undefined}
                onChange={(event) => edit("title", event.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <FieldError id={titleErrorId} message={errors.title} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={descriptionId} className="sr-only">
              {labels.descriptionField}
            </Label>
            <div className="relative">
              <FileText className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden="true" />
              <Textarea
                id={descriptionId}
                name="description"
                value={values.description}
                placeholder={labels.descriptionPlaceholder}
                disabled={disabled || busy}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={errors.description ? descriptionErrorId : undefined}
                onChange={(event) => edit("description", event.target.value)}
                className="min-h-28 py-2.5 pl-9"
              />
            </div>
            <FieldError id={descriptionErrorId} message={errors.description} />
          </div>

          <div className="flex flex-col gap-1.5">
            <ChipRadioGroup
              label={labels.typeField}
              labelId={typeLabelId}
              value={values.type}
              options={types}
              disabled={disabled || busy}
              invalid={Boolean(errors.type)}
              describedBy={errors.type ? typeErrorId : undefined}
              onChange={(type) => edit("type", type)}
              chipClassName={(_, selected) =>
                selected ? "border-primary bg-primary/10 text-foreground hover:bg-primary/10" : "bg-background"
              }
              renderOption={(option, selected) => (
                <>
                  <CheckMark selected={selected} />
                  <span className="truncate">{option.label}</span>
                </>
              )}
            />
            <FieldError id={typeErrorId} message={errors.type} />
          </div>

          <ChipRadioGroup
            label={labels.priorityField}
            labelId={priorityLabelId}
            value={values.priority}
            options={priorities}
            disabled={disabled || busy}
            onChange={(priority) => edit("priority", priority)}
            optionAttribute={(option) => {
              const tone = priorities.find((item) => item.value === option.value)?.tone ?? "muted"
              return { "data-tone": tone }
            }}
            chipClassName={(option, selected) => {
              if (!selected) return "bg-background"
              const tone = priorities.find((item) => item.value === option.value)?.tone ?? "muted"
              return priorityToneClass[tone].selected
            }}
            renderOption={(option) => {
              const tone = priorities.find((item) => item.value === option.value)?.tone ?? "muted"
              return (
                <>
                  <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", priorityToneClass[tone].dot)} />
                  <span className="truncate">{option.label}</span>
                </>
              )
            }}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={environmentId}>{labels.environmentField}</Label>
            <div className="relative">
              <Monitor className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id={environmentId}
                name="environment"
                value={values.environment}
                placeholder={labels.environmentPlaceholder}
                disabled={disabled || busy}
                onChange={(event) => edit("environment", event.target.value)}
                className="h-10 pl-9"
              />
            </div>
            {autoDetectEnvironment ? (
              <button
                type="button"
                className="self-start text-xs font-medium text-primary underline-offset-2 hover:underline disabled:opacity-50"
                onClick={applyDetectedEnvironment}
                disabled={disabled || busy}
              >
                {labels.detectEnvironment}
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div key={file.id} data-slot="bug-report-file" className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/40 p-2">
                {file.url && file.file.type.startsWith("image/") ? (
                  // The filename beside the preview is the accessible name.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground" aria-hidden="true">
                    <Paperclip className="size-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{formatBytes(file.file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`${labels.removeFile} ${file.file.name}`}
                  disabled={disabled || busy}
                  onClick={() => removeFile(file.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {showDropzone ? (
              <div
                data-slot="bug-report-dropzone"
                data-dragover={over ? "" : undefined}
                aria-invalid={fileError ? true : undefined}
                className={cn(
                  "rounded-xl border border-dashed border-border bg-background transition-colors",
                  over && "border-primary bg-primary/5",
                  fileError && "border-destructive",
                )}
                onDragEnter={(event) => {
                  event.preventDefault()
                  dragDepth.current += 1
                  setOver(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault()
                  dragDepth.current = Math.max(0, dragDepth.current - 1)
                  if (dragDepth.current === 0) setOver(false)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  dragDepth.current = 0
                  setOver(false)
                  addFiles([...event.dataTransfer.files])
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  multiple={maxFiles > 1}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only"
                  disabled={disabled || busy}
                  onChange={(event) => {
                    addFiles([...(event.target.files ?? [])])
                    event.target.value = ""
                  }}
                />
                <button
                  type="button"
                  disabled={disabled || busy}
                  aria-describedby={fileError ? `${fileHintId} ${fileErrorId}` : fileHintId}
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1 rounded-xl px-3 py-5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                >
                  <Paperclip className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">{labels.attach}</span>
                  <span id={fileHintId} className="text-xs text-muted-foreground">
                    {hint}
                  </span>
                </button>
              </div>
            ) : null}
            <FieldError id={fileErrorId} message={fileError} />
          </div>

          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "text-sm text-pretty",
              (status === "success" || !statusText) && "sr-only",
              status === "error" && "text-destructive",
              status === "submitting" && "text-muted-foreground",
            )}
          >
            {status === "error" ? <span role="alert">{labels.error}</span> : statusText}
          </p>

          {status === "success" ? (
            <div data-slot="bug-report-success" className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{labels.successDetail}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={disabled || busy || status === "success"}
            aria-busy={busy || undefined}
            className="h-10 w-full rounded-full"
          >
            {busy ? (
              <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : status === "success" ? (
              <Check aria-hidden="true" />
            ) : (
              <Bug aria-hidden="true" />
            )}
            {busy ? labels.submitting : status === "success" ? labels.success : status === "error" ? labels.retry : labels.submit}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
