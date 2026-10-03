"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useId, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type SiteFooterVariant = "columns" | "minimal" | "logo"

export type SiteFooterLink = {
  label: string
  href?: string
  external?: boolean
}

export type SiteFooterColumn = {
  title: string
  links: SiteFooterLink[]
}

export type SiteFooterNewsletter = {
  title?: string
  description?: string
  placeholder?: string
  onSubscribe?: (email: string) => void | Promise<void>
}

export type SiteFooterClassNames = {
  root?: string
  brand?: string
  columns?: string
  newsletter?: string
  legal?: string
  wordmark?: string
}

export type SiteFooterProps = {
  variant?: SiteFooterVariant
  brand?: { name: string; href?: string; mark?: ReactNode }
  tagline?: string
  columns?: SiteFooterColumn[]
  links?: SiteFooterLink[]
  legal?: SiteFooterLink[]
  socials?: SiteFooterLink[]
  newsletter?: SiteFooterNewsletter | null
  status?: { label: string; tone?: "success" | "warning" | "danger"; href?: string } | null
  year?: number
  onNavigate?: (link: SiteFooterLink) => void
  className?: string
  classNames?: SiteFooterClassNames
}

export const siteFooterExampleColumns: SiteFooterColumn[] = [
  { title: "Work", links: [{ label: "Bowls" }, { label: "Sets" }, { label: "Archive" }, { label: "Pricing" }] },
  { title: "Visit", links: [{ label: "Studio" }, { label: "Gallery" }, { label: "Journal" }, { label: "Map", external: true }] },
  { title: "Studio", links: [{ label: "About" }, { label: "Workshops" }, { label: "Shipping" }, { label: "Contact" }] },
]

const exampleLegal: SiteFooterLink[] = [{ label: "Privacy" }, { label: "Terms" }, { label: "Licenses" }]
const exampleSocials: SiteFooterLink[] = [{ label: "X", external: true }, { label: "GitHub", external: true }, { label: "LinkedIn", external: true }]
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function FooterLink({ link, onNavigate, className }: { link: SiteFooterLink; onNavigate?: (link: SiteFooterLink) => void; className?: string }) {
  const content = (
    <>
      <span className="min-w-0 truncate">{link.label}</span>
      {link.external ? <ArrowUpRight className="size-3.5 shrink-0" aria-hidden /> : null}
    </>
  )
  const classes = cn("inline-flex max-w-full items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", className)
  if (link.href) {
    return (
      <a className={classes} href={link.href} onClick={() => onNavigate?.(link)} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    )
  }
  return <button type="button" className={classes} onClick={() => onNavigate?.(link)}>{content}</button>
}

function Newsletter({ title, description, placeholder = "you@example.com", onSubscribe, className }: SiteFooterNewsletter & { className?: string }) {
  const id = useId()
  const reduced = useReducedMotion() ?? false
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const validate = (value: string) => !value.trim() ? "Enter your email address" : EMAIL.test(value.trim()) ? null : "That email doesn't look right"

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (state !== "idle") return
    setTouched(true)
    const problem = validate(email)
    setError(problem)
    if (problem) return
    setState("loading")
    try {
      await (onSubscribe ? onSubscribe(email.trim()) : new Promise((resolve) => setTimeout(resolve, 900)))
      setState("done")
    } catch {
      setState("idle")
      setError("We couldn't subscribe you. Try again in a moment")
    }
  }

  const message = state === "done" ? `Check ${email.trim()} to confirm` : error ?? description
  const tone = state === "done" ? "success" : error ? "error" : "hint"

  return (
    <form className={cn("grid max-w-sm gap-2", className)} onSubmit={submit} noValidate aria-labelledby={title ? `${id}-title` : undefined}>
      {title ? <h2 id={`${id}-title`} className="text-sm font-medium text-foreground">{title}</h2> : null}
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Label className="sr-only" htmlFor={`${id}-email`}>Email address</Label>
        <Input
          id={`${id}-email`}
          className="min-w-0 flex-1"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={placeholder}
          value={email}
          readOnly={state !== "idle"}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-message`}
          onChange={(event) => { setEmail(event.target.value); if (touched) setError(validate(event.target.value)) }}
          onBlur={() => { if (email) { setTouched(true); setError(validate(email)) } }}
        />
        <Button type="submit" size="sm" disabled={state === "done"} aria-busy={state === "loading" || undefined}>
          {state === "done" ? <><Check aria-hidden />Subscribed</> : "Subscribe"}
        </Button>
      </div>
      <div id={`${id}-message`} aria-live="polite">
        {message ? (
          <motion.p
            key={message}
            role={tone === "error" ? "alert" : undefined}
            data-tone={tone}
            className={cn("text-xs text-muted-foreground", tone === "error" && "text-destructive", tone === "success" && "text-primary")}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : motionPresets.duration.standard }}
          >
            {message}
          </motion.p>
        ) : null}
      </div>
    </form>
  )
}

/**
 * A site footer with link columns and a newsletter, a single quiet row, or a closing
 * line of the brand name in the host foreground.
 */
export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(function SiteFooter({
  variant = "columns",
  brand = { name: "Studio" },
  tagline = "Pieces thrown, glazed, and fired in small batches.",
  columns = siteFooterExampleColumns,
  links,
  legal = exampleLegal,
  socials = exampleSocials,
  newsletter = { title: "Notes from the kiln", description: "One email a month. Unsubscribe anytime." },
  status = { label: "Kiln schedule is normal", tone: "success" },
  year = new Date().getFullYear(),
  onNavigate,
  className,
  classNames,
}, ref) {
  const reduced = useReducedMotion() ?? false
  const mark = brand.mark ?? <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-xs text-foreground">{brand.name.slice(0, 1)}</span>
  const brandNode = (
    <span className={cn("inline-flex min-w-0 items-center gap-2", classNames?.brand)}>
      {mark}
      <FooterLink link={{ label: brand.name, href: brand.href }} onNavigate={onNavigate} className="font-medium text-foreground" />
    </span>
  )
  const toneClass = { success: "bg-primary", warning: "bg-muted-foreground", danger: "bg-destructive" }
  const statusNode = status ? (
    status.href ? (
      <a className="inline-flex items-center gap-2 text-sm text-muted-foreground" href={status.href} data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label, href: status.href })}>
        <span className={cn("size-2 rounded-full", toneClass[status.tone ?? "success"])} aria-hidden />
        {status.label}
      </a>
    ) : (
      <button type="button" className="inline-flex items-center gap-2 text-sm text-muted-foreground" data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label })}>
        <span className={cn("size-2 rounded-full", toneClass[status.tone ?? "success"])} aria-hidden />
        {status.label}
      </button>
    )
  ) : null
  const socialNode = socials.length > 0 ? (
    <ul className="flex flex-wrap gap-3" aria-label="Social">
      {socials.map((link) => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}
    </ul>
  ) : null
  const legalRow = (
    <div className={cn("flex flex-col gap-3 border-t border-border py-4 sm:flex-row sm:items-center sm:justify-between", classNames?.legal)}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm text-muted-foreground">© {year} {brand.name}</span>
        {legal.length > 0 ? (
          <ul className="flex flex-wrap gap-3" aria-label="Legal">
            {legal.map((link) => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}
          </ul>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-4">{statusNode}{socialNode}</div>
    </div>
  )
  const columnNav = (
    <nav className={cn("grid min-w-0 gap-6 sm:grid-cols-3", classNames?.columns)} aria-label="Footer">
      {columns.map((column) => (
        <div key={column.title} className="grid gap-2">
          <h2 className="text-sm font-medium">{column.title}</h2>
          <ul className="grid gap-1.5">
            {column.links.map((link) => <li key={link.label} className="min-w-0"><FooterLink link={link} onNavigate={onNavigate} /></li>)}
          </ul>
        </div>
      ))}
    </nav>
  )

  if (variant === "minimal") {
    const rowLinks = links ?? columns.map((column) => column.links[0]).filter(Boolean).concat(legal.slice(0, 2))
    return (
      <footer ref={ref} data-slot="site-footer" data-variant="minimal" className={cn("@container w-full min-w-0 border-t border-border px-4 text-foreground", className, classNames?.root)}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {brandNode}
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-3">{rowLinks.map((link) => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>
            </nav>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 text-sm break-words text-muted-foreground">© {year} {brand.name}. {tagline}</span>
            <div className="flex flex-wrap items-center gap-4">{statusNode}{socialNode}</div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer ref={ref} data-slot="site-footer" data-variant={variant} className={cn("@container w-full min-w-0 border-t border-border px-4 text-foreground", className, classNames?.root)}>
      <div className="mx-auto grid w-full max-w-6xl gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid min-w-0 content-start gap-4">
          {brandNode}
          {tagline ? <p className="max-w-sm text-sm text-pretty break-words text-muted-foreground">{tagline}</p> : null}
          {newsletter && variant === "columns" ? <Newsletter {...newsletter} className={classNames?.newsletter} /> : null}
        </div>
        {columnNav}
      </div>
      <div className="mx-auto w-full max-w-6xl">{legalRow}</div>
      {variant === "logo" ? (
        <motion.p
          data-slot="site-footer-wordmark"
          aria-hidden="true"
          className={cn("mx-auto w-full max-w-6xl overflow-hidden pb-2 text-center text-[clamp(3.5rem,18vw,8rem)] leading-none font-semibold tracking-tight break-all text-foreground/15", classNames?.wordmark)}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0 : motionPresets.duration.considered, ease: [...motionPresets.ease.enter] }}
        >
          {brand.name}
        </motion.p>
      ) : null}
    </footer>
  )
})
