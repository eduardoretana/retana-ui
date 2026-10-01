"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useEffect, useId, useRef, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"
import { ArrowRight } from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { AnimatedCounter } from "@/registry/retana/ui/animated-counter"
import { motionPresets } from "@/registry/retana/lib/motion"

import { newsletterCopy, newsletterPublication, newsletterReaders } from "./newsletter-signup-data"
import type { NewsletterIssue, NewsletterPublication } from "./newsletter-signup-data"

export type { NewsletterIssue, NewsletterPublication, NewsletterStory } from "./newsletter-signup-data"
export type NewsletterVariant = "inline" | "card"

export interface NewsletterSignupProps {
  /** `inline` puts the copy and form beside the issue stack; `card` is a self-contained card with the stack in a tray on top. */
  variant?: NewsletterVariant
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  /** Short line under the form about frequency and privacy. */
  privacyNote?: ReactNode
  /** Link after the privacy note. Pass null to hide it. */
  privacyLink?: { label: string; href: string } | null
  /** Reader count and up to three faces. The count ticks up by one when someone subscribes. Pass null to hide it. */
  readers?: { count: number; faces: string[] } | null
  /** The issue stack. On success the upcoming issue, addressed to the new reader, lands on top. Pass null for a form without the stack. */
  publication?: NewsletterPublication | null
  /** Called with a valid, trimmed email. Reject to show an error and keep the email; resolve to show the success state. */
  onSubscribe?: (email: string) => void | Promise<void>
  className?: string
  classNames?: NewsletterSignupClassNames
}

export type NewsletterSignupClassNames = {
  root?: string
  title?: string
  description?: string
  form?: string
  stack?: string
  readers?: string
}

type Phase = "idle" | "sending" | "done"
type Problem = { kind: "invalid" | "failed"; text: string }
type Bezier = [number, number, number, number]
const enter = [...motionPresets.ease.enter] as Bezier
const standard = [...motionPresets.ease.standard] as Bezier
const MESSAGES = {
  empty: "Enter your email address",
  format: "Enter an email like name@company.com",
  failed: "That didn't go through. Your email is kept, so try again.",
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const STEP = 12

function validate(value: string): Problem | null {
  const email = value.trim()
  if (!email) return { kind: "invalid", text: MESSAGES.empty }
  if (!EMAIL.test(email)) return { kind: "invalid", text: MESSAGES.format }
  return null
}

const swapIn = { opacity: 0, y: 6, filter: `blur(${motionPresets.blur.subtle}px)` }
const swapShown = { opacity: 1, y: 0, filter: "blur(0px)" }
const swapOut = { opacity: 0, y: -6, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.14, ease: standard } }
const fadeIn = { opacity: 0 }
const fadeOut = { opacity: 0, transition: { duration: 0.1 } }

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

function isImage(value: string) {
  return value.startsWith("/") || value.startsWith("http") || value.startsWith("data:")
}

function Swap({ id, children, reduced, className, live }: { id: string; children: ReactNode; reduced: boolean; className?: string; live?: "polite" }) {
  return (
    <div className={className} aria-live={live}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div key={id} initial={reduced ? fadeIn : swapIn} animate={swapShown} exit={reduced ? fadeOut : swapOut} transition={{ duration: reduced ? 0.12 : 0.26, ease: enter }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function IssueCard({ issue, name, to }: { issue: NewsletterIssue; name: string; to?: string }) {
  return (
    <>
      <header className="flex items-baseline justify-between gap-3">
        <span className="font-heading text-xl font-medium tracking-tight">{name}</span>
        <span className="text-xs text-muted-foreground tabular-nums">Issue {issue.number}</span>
      </header>
      <p className="m-0 mt-0.5 flex min-w-0 gap-1.5 text-xs whitespace-nowrap text-muted-foreground">
        <span>{issue.date}</span>
        {to ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="min-w-0 truncate text-muted-foreground">
              To <span className="text-foreground">{to}</span>
            </span>
          </>
        ) : null}
      </p>
      <h3 className="mt-5 mb-4 border-t border-border pt-5 font-heading text-xl font-medium tracking-tight text-balance">{issue.subject}</h3>
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {issue.stories.slice(0, 3).map((story) => (
          <li key={story.title} className="grid min-h-11 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3">
            {story.image ? (
              <img className="size-11 rounded-lg bg-muted object-cover" src={story.image} alt="" width={44} height={44} />
            ) : (
              <span className="grid size-11 place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground" aria-hidden="true">
                {story.title.slice(0, 1)}
              </span>
            )}
            <span className="line-clamp-2 text-sm text-pretty text-muted-foreground">{story.title}</span>
            <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">{story.minutes} min</span>
          </li>
        ))}
      </ul>
    </>
  )
}

type Placement = { depth: number; upcoming: boolean }
const stackVariants: Variants = {
  placed: ({ depth }: Placement) => ({ opacity: 1, y: -depth * STEP, scale: 1 - depth * 0.045 }),
  away: ({ upcoming }: Placement) => (upcoming ? { opacity: 0, y: 56, scale: 1 } : { opacity: 0, y: -3 * STEP, scale: 1 - 3 * 0.045 }),
}
const settle = { ...motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.instant, ease: "linear" as const } }
const still = { duration: 0, opacity: { duration: motionPresets.duration.fast } }

function IssueStack({ publication, delivered, to, reduced, compact, className }: { publication: NewsletterPublication; delivered: boolean; to: string; reduced: boolean; compact?: boolean; className?: string }) {
  const issues = (delivered ? [publication.upcoming, ...publication.recent] : publication.recent).slice(0, 3)
  return (
    <div data-slot="newsletter-stack" className={cn("grid w-full max-w-md pt-6", className)}>
      <div className="invisible col-start-1 row-start-1 rounded-xl border border-transparent p-5" aria-hidden="true">
        <IssueCard issue={publication.upcoming} name={publication.name} to={to || " "} />
      </div>
      <AnimatePresence initial={false}>
        {issues.map((issue, depth) => {
          const upcoming = issue === publication.upcoming
          const placement: Placement = { depth, upcoming }
          return (
            <motion.article
              key={issue.number}
              className={cn(
                "col-start-1 row-start-1 origin-top rounded-xl border border-border p-5",
                depth === 0 && "bg-card shadow-sm",
                depth === 1 && "bg-muted",
                depth >= 2 && "bg-muted/70",
                compact && "shadow-none",
              )}
              data-depth={depth}
              aria-hidden={depth > 0 ? true : undefined}
              aria-label={depth === 0 ? `${publication.name}, issue ${issue.number}` : undefined}
              custom={placement}
              variants={stackVariants}
              initial="away"
              animate="placed"
              exit="away"
              transition={reduced ? still : settle}
              style={{ zIndex: 3 - depth }}
            >
              <IssueCard issue={issue} name={publication.name} to={upcoming ? to : undefined} />
            </motion.article>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function Readers({ readers, done, reduced, className }: { readers: { count: number; faces: string[] }; done: boolean; reduced: boolean; className?: string }) {
  return (
    <div data-slot="newsletter-readers" className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <AvatarGroup aria-hidden="true">
        {readers.faces.slice(0, 3).map((face) => (
          <Avatar key={face} size="sm">
            {isImage(face) ? <AvatarImage src={face} alt="" /> : null}
            <AvatarFallback>{initials(face)}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <span className="min-w-0 tabular-nums">
        <AnimatedCounter value={readers.count + (done ? 1 : 0)} className="inline text-sm font-medium text-foreground" /> readers
        <AnimatePresence initial={false}>
          {done ? (
            <motion.span key="you" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0.12 : motionPresets.duration.standard, ease: enter, delay: reduced ? 0 : 0.18 }}>
              , including you
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </div>
  )
}

/**
 * A newsletter signup framed by the newsletter itself. Subscribing drops the next issue, addressed to the new reader, onto the stack and ticks the reader count up by one.
 */
export const NewsletterSignup = forwardRef<HTMLElement, NewsletterSignupProps>(function NewsletterSignup({
  variant = "inline",
  title,
  description,
  placeholder = "you@company.com",
  buttonLabel = "Subscribe",
  privacyNote = newsletterCopy.privacy,
  privacyLink = newsletterCopy.privacyLink,
  readers = newsletterReaders,
  publication = newsletterPublication,
  onSubscribe,
  className,
  classNames,
}, ref) {
  const id = useId()
  const reduced = !!useReducedMotion()
  const [email, setEmail] = useState("")
  const [problem, setProblem] = useState<Problem | null>(null)
  const [tried, setTried] = useState(false)
  const [phase, setPhase] = useState<Phase>("idle")
  const [sentTo, setSentTo] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const again = useRef<HTMLButtonElement>(null)
  const busy = useRef(false)
  const refocus = useRef(false)
  const [pill, animatePill] = useAnimate<HTMLDivElement>()
  const copy = newsletterCopy[variant]

  useEffect(() => {
    if (phase === "idle" && refocus.current) {
      refocus.current = false
      input.current?.focus()
    }
    if (phase === "done") again.current?.focus()
  }, [phase])

  function shake() {
    if (reduced || !pill.current) return
    void animatePill(pill.current, { x: [0, -6, 5, -3, 1, 0] }, { duration: 0.36, ease: "easeOut" })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy.current || phase !== "idle") return
    setTried(true)
    const found = validate(email)
    setProblem(found)
    if (found) {
      shake()
      input.current?.focus()
      return
    }
    const value = email.trim()
    busy.current = true
    setPhase("sending")
    try {
      await (onSubscribe ? onSubscribe(value) : new Promise((resolve) => setTimeout(resolve, 1100)))
      setSentTo(value)
      setPhase("done")
    } catch {
      setPhase("idle")
      setProblem({ kind: "failed", text: MESSAGES.failed })
      shake()
    } finally {
      busy.current = false
    }
  }

  function reset() {
    setEmail("")
    setProblem(null)
    setTried(false)
    refocus.current = true
    setPhase("idle")
  }

  const done = phase === "done"
  const sending = phase === "sending"
  const messageId = `${id}-message`
  const labelKey = done ? "done" : sending ? "sending" : problem?.kind === "failed" ? "retry" : "idle"
  const labels: Record<string, ReactNode> = {
    idle: (
      <>
        {buttonLabel}
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </>
    ),
    retry: (
      <>
        Try again
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </>
    ),
    sending: (
      <>
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
        Subscribing
      </>
    ),
    done: (
      <>
        <CheckMark reduced={reduced} />
        Subscribed
      </>
    ),
  }
  const doneText = "Check your inbox to confirm."
  const note = (
    <>
      {privacyNote}
      {privacyLink ? (
        <>
          {" "}
          <a className="text-foreground underline decoration-border underline-offset-4 hover:decoration-current" href={privacyLink.href}>
            {privacyLink.label}
          </a>
        </>
      ) : null}
    </>
  )
  const form = (
    <form data-slot="newsletter-form" className={cn("@container/signup grid min-w-0 gap-3", classNames?.form)} onSubmit={submit} noValidate aria-label={title ?? copy.title}>
      <motion.div ref={pill} className="flex h-14 items-center gap-1.5 rounded-full border border-border bg-card py-1 pr-1 pl-4 focus-within:border-foreground data-[invalid]:border-destructive data-[done]:border-primary/40 @max-[300px]/signup:h-auto @max-[300px]/signup:flex-col @max-[300px]/signup:items-stretch @max-[300px]/signup:border-0 @max-[300px]/signup:bg-transparent @max-[300px]/signup:p-0" data-invalid={problem ? "" : undefined} data-done={done ? "" : undefined}>
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <Input
          ref={input}
          id={`${id}-email`}
          className="h-full flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 md:text-base @max-[300px]/signup:h-12 @max-[300px]/signup:rounded-full @max-[300px]/signup:border @max-[300px]/signup:px-4"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="send"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={placeholder}
          value={email}
          readOnly={phase !== "idle"}
          aria-invalid={problem?.kind === "invalid" ? true : undefined}
          aria-describedby={messageId}
          onBlur={() => {
            if (email.trim() && !tried && phase === "idle") {
              setTried(true)
              setProblem(validate(email))
            }
          }}
          onChange={(event) => {
            setEmail(event.target.value)
            if (tried) setProblem(validate(event.target.value))
            else if (problem) setProblem(null)
          }}
        />
        <Button
          type={done ? "button" : "submit"}
          className="h-full min-h-11 shrink-0 rounded-full px-5"
          aria-label={labelKey === "done" ? "Subscribed" : labelKey === "sending" ? "Subscribing" : labelKey === "retry" ? "Try again" : buttonLabel}
          aria-busy={sending || undefined}
          aria-disabled={sending || done || undefined}
          disabled={sending}
          tabIndex={done ? -1 : undefined}
          onClick={done ? (event) => event.preventDefault() : undefined}
        >
          <span className="inline-grid place-items-center">
            <span className="invisible col-start-1 row-start-1 inline-flex items-center gap-2" aria-hidden="true">
              Subscribed
            </span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={labelKey} className="col-start-1 row-start-1 inline-flex items-center gap-2" initial={reduced ? fadeIn : swapIn} animate={swapShown} exit={reduced ? fadeOut : swapOut} transition={{ duration: reduced ? 0.12 : 0.24, ease: enter }}>
                {labels[labelKey]}
              </motion.span>
            </AnimatePresence>
          </span>
        </Button>
      </motion.div>
      <div className="grid">
        <Swap id={problem ? `problem-${problem.text}` : done ? "done" : "note"} reduced={reduced} className="col-start-1 row-start-1 min-w-0" live="polite">
          <p id={messageId} className={cn("m-0 pl-4 text-sm text-pretty text-muted-foreground", problem && "text-destructive", done && "text-foreground")} role={problem ? "alert" : undefined}>
            {problem?.text ??
              (done ? (
                <>
                  {doneText}
                  <span className="sr-only"> The link went to {sentTo}.</span>{" "}
                  <button ref={again} type="button" className="text-foreground underline decoration-border underline-offset-4" onClick={reset}>
                    Use a different email
                  </button>
                </>
              ) : (
                note
              ))}
          </p>
        </Swap>
      </div>
    </form>
  )

  const root = cn("@container/newsletter w-full min-w-0 bg-background text-foreground", className, classNames?.root)

  if (variant === "card") {
    return (
      <section ref={ref} data-slot="newsletter-signup" data-variant="card" className={cn(root, "px-4 py-12")} aria-labelledby={`${id}-title`}>
        <div className="mx-auto grid w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {publication ? (
            <div className="h-60 overflow-hidden border-b border-border bg-muted px-6 pt-5">
              <IssueStack publication={publication} delivered={done} to={sentTo} reduced={reduced} compact className={classNames?.stack} />
            </div>
          ) : null}
          <div className="grid gap-2 p-6">
            <h2 id={`${id}-title`} className={cn("m-0 font-heading text-2xl font-medium tracking-tight text-balance", classNames?.title)}>
              {title ?? copy.title}
            </h2>
            <p className={cn("m-0 text-pretty text-muted-foreground", classNames?.description)}>{description ?? copy.description}</p>
            <div className="mt-4">{form}</div>
            {readers ? <Readers readers={readers} done={done} reduced={reduced} className={cn("mt-4 border-t border-border pt-4", classNames?.readers)} /> : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} data-slot="newsletter-signup" data-variant="inline" className={root} aria-labelledby={`${id}-title`}>
      <div className={cn("mx-auto grid max-w-6xl gap-12 px-4 py-12 @min-[860px]/newsletter:items-center @min-[860px]/newsletter:px-8 @min-[860px]/newsletter:py-24", (publication || readers) && "@min-[860px]/newsletter:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]")}>
        <div className="grid max-w-xl">
          <h2 id={`${id}-title`} className={cn("m-0 font-heading text-3xl font-medium tracking-tight text-balance @min-[860px]/newsletter:text-4xl", classNames?.title)}>
            {title ?? copy.title}
          </h2>
          <p className={cn("mt-4 mb-0 text-pretty text-muted-foreground @min-[860px]/newsletter:text-lg", classNames?.description)}>{description ?? copy.description}</p>
          <div className="mt-8">{form}</div>
        </div>
        {publication || readers ? (
          <div className="grid min-w-0 justify-items-center gap-6">
            {publication ? <IssueStack publication={publication} delivered={done} to={sentTo} reduced={reduced} className={classNames?.stack} /> : null}
            {readers ? <Readers readers={readers} done={done} reduced={reduced} className={classNames?.readers} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
})

NewsletterSignup.displayName = "NewsletterSignup"

function CheckMark({ reduced }: { reduced: boolean }) {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 0.34, ease: enter, delay: reduced ? 0 : 0.12 }} />
    </svg>
  )
}
