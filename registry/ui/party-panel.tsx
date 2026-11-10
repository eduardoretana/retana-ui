"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Los campos sensibles llegan enmascarados. Mostrar llama onReveal con el id.
 */

import { useState } from "react"
import { Download } from "lucide-react"

import { cn } from "@/lib/utils"
import { deskInitials, type DeskPresence } from "@/registry/retana/lib/inbox"
import { presenceDotStyle, type PartyDeal, type PartyFact, type PartyFile, type PartyMember, type SecretField } from "@/registry/retana/lib/thread-desk"

export type PartyAction = {
  id: string
  label: string
  onSelect?: () => void
}

export type PartyPanelProps = {
  name?: string
  meta?: string
  presence?: DeskPresence
  actions?: readonly PartyAction[]
  deal?: PartyDeal
  facts?: readonly PartyFact[]
  members?: readonly PartyMember[]
  files?: readonly PartyFile[]
  secrets?: readonly SecretField[]
  revealLabel?: string
  onReveal?: (id: string) => void
  onDownload?: (id: string) => void
  downloadLabel?: string
  membersLabel?: string
  filesLabel?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

function SecretRow({ field, revealLabel, onReveal }: { field: SecretField; revealLabel: string; onReveal?: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{field.label}</span>
        <span className="block text-sm tabular-nums" data-revealed={open ? "true" : "false"}>
          {open ? field.revealed : field.masked}
        </span>
      </span>
      <button
        type="button"
        className="h-11 shrink-0 rounded-full px-3 text-sm font-medium text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => {
          if (open) return
          setOpen(true)
          onReveal?.(field.id)
        }}
      >
        {revealLabel}
      </button>
    </div>
  )
}

export function PartyPanel({
  name,
  meta,
  presence,
  actions = [],
  deal,
  facts = [],
  members = [],
  files = [],
  secrets = [],
  revealLabel = "Mostrar",
  onReveal,
  onDownload,
  downloadLabel = "Descargar",
  membersLabel = "Miembros",
  filesLabel = "Archivos",
  state = "ready",
  emptyLabel = "Sin ficha",
  loadingLabel = "Cargando la ficha",
  error,
  className,
}: PartyPanelProps) {
  if (state === "loading") return <div role="status" aria-label={loadingLabel} className="h-48 animate-pulse rounded-2xl bg-muted" />
  if (state === "error") {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (state === "empty" || !name) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  return (
    <aside data-slot="party-panel" className={cn("flex flex-col gap-5", className)}>
      <div className="grid justify-items-center gap-2 text-center">
        <span className="relative grid size-16 place-items-center rounded-full bg-foreground text-lg font-semibold text-background" aria-hidden>
          {deskInitials(name)}
          {presence ? (
            <span data-presence={presence} className="absolute end-1 bottom-1 size-3 rounded-full ring-2 ring-background" style={presenceDotStyle(presence)} />
          ) : null}
        </span>
        <h2 className="text-base font-semibold">{name}</h2>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {actions.length ? (
        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="grid h-16 place-items-center rounded-2xl bg-muted px-2 text-center text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={action.onSelect}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
      {deal ? (
        <section className="grid gap-2 rounded-2xl bg-muted/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">{deal.title}</h3>
            <span className="text-xs text-muted-foreground">{deal.status}</span>
          </div>
          <p className="text-sm tabular-nums">{deal.amount}</p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={deal.value}
            aria-label={deal.label}
            className="h-2 overflow-hidden rounded-full bg-background"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, deal.value))}%` }} />
          </div>
          <p className="text-end text-xs text-muted-foreground tabular-nums">{deal.label}</p>
        </section>
      ) : null}
      {facts.length ? (
        <dl className="grid gap-3">
          {facts.map((fact) => (
            <div key={fact.id} className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="text-sm font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {secrets.length ? (
        <div className="divide-y divide-border border-y border-border">
          {secrets.map((field) => (
            <SecretRow key={field.id} field={field} revealLabel={revealLabel} onReveal={onReveal} />
          ))}
        </div>
      ) : null}
      {members.length ? (
        <section className="grid gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{membersLabel}</h3>
          <ul className="grid gap-2">
            {members.map((member) => (
              <li key={member.id} className="flex min-h-11 items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-muted text-[10px] font-medium" aria-hidden>
                  {deskInitials(member.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{member.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{member.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {files.length ? (
        <section className="grid gap-2">
          <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{filesLabel}</h3>
          <ul className="grid gap-2">
            {files.map((file) => (
              <li key={file.id} className="flex min-h-11 items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{file.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{file.detail}</span>
                </span>
                <button
                  type="button"
                  aria-label={`${downloadLabel} ${file.name}`}
                  className="grid size-11 place-items-center rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => onDownload?.(file.id)}
                >
                  <Download className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  )
}
