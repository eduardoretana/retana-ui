"use client"

/**
 * Clean-room new-company dialog. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, or assets were copied.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  companyDraftIssues,
  CRM_LOGO_MAX_BYTES,
  CRM_LOGO_TYPES,
  crmInitials,
  EMPTY_COMPANY_DRAFT,
  type CrmCompanyDraft,
  type CrmDraftIssue,
} from "@/registry/retana/lib/crm-companies"

export type CrmCompanyOption = {
  value: string
  label: string
}

export type CrmNewCompanyLabels = {
  title?: string
  description?: string
  identity?: string
  relationship?: string
  commercial?: string
  logo?: string
  upload?: string
  removeLogo?: string
  name?: string
  email?: string
  website?: string
  status?: string
  statusPlaceholder?: string
  owner?: string
  ownerPlaceholder?: string
  industry?: string
  region?: string
  pipeline?: string
  notes?: string
  cancel?: string
  save?: string
  invalid?: string
  issues?: Partial<Record<CrmDraftIssue, string>>
}

export type CrmNewCompanyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  statuses: readonly CrmCompanyOption[]
  owners: readonly CrmCompanyOption[]
  onSubmit: (draft: CrmCompanyDraft & { logoUrl?: string }) => void
  labels?: CrmNewCompanyLabels
  className?: string
}

const ISSUE_TEXT: Record<CrmDraftIssue, string> = {
  "name-required": "Enter a name",
  "status-required": "Choose a status",
  "owner-required": "Choose an owner",
  "email-invalid": "Enter a valid email",
  "website-invalid": "Website must start with http:// or https://",
  "pipeline-invalid": "Enter a pipeline value of zero or more",
  "logo-type": "Logo must be a PNG, JPEG, WebP, or GIF",
  "logo-size": "Logo must be 2 MB or smaller",
}

function message(code: CrmDraftIssue, labels?: CrmNewCompanyLabels) {
  return labels?.issues?.[code] ?? ISSUE_TEXT[code]
}

export function CrmNewCompanyDialog({
  open,
  onOpenChange,
  statuses,
  owners,
  onSubmit,
  labels,
  className,
}: CrmNewCompanyDialogProps) {
  const base = React.useId()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [draft, setDraft] = React.useState<CrmCompanyDraft>(EMPTY_COMPANY_DRAFT)
  const [logoUrl, setLogoUrl] = React.useState<string>()
  const [issues, setIssues] = React.useState<CrmDraftIssue[]>([])
  const wasOpen = React.useRef(false)

  const copy = {
    title: labels?.title ?? "New company",
    description: labels?.description ?? "Add a company to the book. Required fields are marked.",
    identity: labels?.identity ?? "Identity",
    relationship: labels?.relationship ?? "Relationship",
    commercial: labels?.commercial ?? "Commercial",
    logo: labels?.logo ?? "Logo",
    upload: labels?.upload ?? "Upload logo",
    removeLogo: labels?.removeLogo ?? "Remove logo",
    name: labels?.name ?? "Name",
    email: labels?.email ?? "Email",
    website: labels?.website ?? "Website",
    status: labels?.status ?? "Status",
    statusPlaceholder: labels?.statusPlaceholder ?? "Choose a status",
    owner: labels?.owner ?? "Owner",
    ownerPlaceholder: labels?.ownerPlaceholder ?? "Choose an owner",
    industry: labels?.industry ?? "Industry",
    region: labels?.region ?? "Region",
    pipeline: labels?.pipeline ?? "Pipeline value",
    notes: labels?.notes ?? "Notes",
    cancel: labels?.cancel ?? "Cancel",
    save: labels?.save ?? "Save company",
    invalid: labels?.invalid ?? "Fix the highlighted fields",
  }

  React.useEffect(() => {
    if (open && !wasOpen.current) {
      setDraft(EMPTY_COMPANY_DRAFT)
      setLogoUrl(undefined)
      setIssues([])
    }
    wasOpen.current = open
  }, [open])

  function patch(partial: Partial<CrmCompanyDraft>) {
    setDraft((current) => ({ ...current, ...partial }))
  }

  function onFile(file: File | undefined) {
    if (!file) return
    const logo = { type: file.type, size: file.size }
    patch({ logo })
    if (!CRM_LOGO_TYPES.includes(file.type as (typeof CRM_LOGO_TYPES)[number]) || file.size > CRM_LOGO_MAX_BYTES) {
      setLogoUrl(undefined)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setLogoUrl(typeof reader.result === "string" ? reader.result : undefined)
    }
    reader.readAsDataURL(file)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = companyDraftIssues(draft)
    setIssues(next)
    if (next.length > 0) {
      const field: Record<CrmDraftIssue, string> = {
        "name-required": `${base}-name`,
        "status-required": `${base}-status`,
        "owner-required": `${base}-owner`,
        "email-invalid": `${base}-email`,
        "website-invalid": `${base}-website`,
        "pipeline-invalid": `${base}-pipeline`,
        "logo-type": `${base}-logo`,
        "logo-size": `${base}-logo`,
      }
      document.getElementById(field[next[0]])?.focus()
      return
    }
    onSubmit({ ...draft, logoUrl })
    onOpenChange(false)
  }

  function errorFor(codes: CrmDraftIssue[]) {
    const code = codes.find((item) => issues.includes(item))
    if (!code) return null
    return message(code, labels)
  }

  const logoError = errorFor(["logo-type", "logo-size"])
  const nameError = errorFor(["name-required"])
  const emailError = errorFor(["email-invalid"])
  const websiteError = errorFor(["website-invalid"])
  const statusError = errorFor(["status-required"])
  const ownerError = errorFor(["owner-required"])
  const pipelineError = errorFor(["pipeline-invalid"])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[min(40rem,calc(100dvh-2rem))] overflow-y-auto sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
          {issues.length > 0 ? (
            <p role="alert" className="text-sm text-destructive">
              {copy.invalid}
            </p>
          ) : null}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">{copy.identity}</legend>
            <div className="flex flex-wrap items-center gap-3">
              <Avatar size="lg">
                {logoUrl ? <AvatarImage src={logoUrl} alt="" /> : null}
                <AvatarFallback>{crmInitials(draft.name || "?")}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                <Label htmlFor={`${base}-logo`}>{copy.logo}</Label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                    {copy.upload}
                  </Button>
                  {logoUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setLogoUrl(undefined)
                        patch({ logo: null })
                        if (fileRef.current) fileRef.current.value = ""
                      }}
                    >
                      {copy.removeLogo}
                    </Button>
                  ) : null}
                </div>
                <input
                  ref={fileRef}
                  id={`${base}-logo`}
                  className="sr-only"
                  type="file"
                  accept={CRM_LOGO_TYPES.join(",")}
                  aria-label={copy.upload}
                  aria-invalid={logoError ? true : undefined}
                  aria-describedby={logoError ? `${base}-logo-error` : undefined}
                  onChange={(event) => onFile(event.target.files?.[0])}
                />
                {logoError ? (
                  <p id={`${base}-logo-error`} className="text-xs text-destructive">
                    {logoError}
                  </p>
                ) : null}
              </div>
            </div>
            <Field
              id={`${base}-name`}
              label={copy.name}
              required
              value={draft.name}
              error={nameError}
              onChange={(name) => patch({ name })}
            />
            <Field
              id={`${base}-email`}
              label={copy.email}
              type="email"
              value={draft.email}
              error={emailError}
              onChange={(email) => patch({ email })}
            />
            <Field
              id={`${base}-website`}
              label={copy.website}
              value={draft.website}
              error={websiteError}
              onChange={(website) => patch({ website })}
            />
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">{copy.relationship}</legend>
            <Choice
              id={`${base}-status`}
              label={copy.status}
              placeholder={copy.statusPlaceholder}
              value={draft.status}
              options={statuses}
              error={statusError}
              onChange={(status) => patch({ status })}
            />
            <Choice
              id={`${base}-owner`}
              label={copy.owner}
              placeholder={copy.ownerPlaceholder}
              value={draft.ownerId}
              options={owners}
              error={ownerError}
              onChange={(ownerId) => patch({ ownerId })}
            />
            <Field id={`${base}-industry`} label={copy.industry} value={draft.industry} onChange={(industry) => patch({ industry })} />
            <Field id={`${base}-region`} label={copy.region} value={draft.region} onChange={(region) => patch({ region })} />
          </fieldset>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">{copy.commercial}</legend>
            <Field
              id={`${base}-pipeline`}
              label={copy.pipeline}
              required
              inputMode="decimal"
              value={draft.pipelineValue}
              error={pipelineError}
              onChange={(pipelineValue) => patch({ pipelineValue })}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${base}-notes`}>{copy.notes}</Label>
              <Textarea id={`${base}-notes`} value={draft.notes} onChange={(event) => patch({ notes: event.target.value })} />
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {copy.cancel}
            </Button>
            <Button type="submit">{copy.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  inputMode,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string | null
  required?: boolean
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Choice({
  id,
  label,
  placeholder,
  value,
  options,
  error,
  onChange,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  options: readonly CrmCompanyOption[]
  error?: string | null
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        <span aria-hidden="true"> *</span>
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
