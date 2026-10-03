"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useEffect, useId, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent, ReactNode } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { Check, Clock, Mail, MessageCircle, Phone, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ContactSectionVariant = "form" | "channels" | "offices"

export type ContactMessage = {
  name: string
  email: string
  topic: string
  message: string
}

export type ContactChannel = {
  value: string
  label: string
  meta: string
  icon?: ReactNode
  detail: ReactNode
}

export type ContactOffice = {
  city: string
  timeZone: string
  address: string[]
  email?: string
  hours?: [number, number]
}

export type ContactSectionClassNames = {
  root?: string
  intro?: string
  form?: string
  channels?: string
  offices?: string
}

export type ContactSectionProps = {
  variant?: ContactSectionVariant
  title?: string
  description?: string
  topics?: string[]
  onSubmit?: (message: ContactMessage) => void | Promise<void>
  channels?: ContactChannel[]
  channel?: string
  defaultChannel?: string
  onChannelChange?: (value: string) => void
  offices?: ContactOffice[]
  className?: string
  classNames?: ContactSectionClassNames
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_MESSAGE = 500
const ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true } as const

type Errors = Partial<Record<"name" | "email" | "message", string>>

function validate(values: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = "Enter your name"
  if (!values.email.trim()) errors.email = "Enter your email address"
  else if (!EMAIL.test(values.email.trim())) errors.email = "Enter an email like name@example.com"
  if (values.message.trim().length < 20) errors.message = values.message.trim() ? "Add a little more detail, at least 20 characters" : "Tell us how we can help"
  return errors
}

function TopicPicker({ topics, value, onChange, reduced }: { topics: string[]; value: string; onChange: (topic: string) => void; reduced: boolean }) {
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  function onKeyDown(event: KeyboardEvent) {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0
    if (!delta || topics.length === 0) return
    event.preventDefault()
    const next = (Math.max(0, topics.indexOf(value)) + delta + topics.length) % topics.length
    onChange(topics[next])
    refs.current[next]?.focus()
  }
  return (
    <div className="grid gap-1.5">
      <span id={`${id}-label`} className="text-sm font-medium">Topic</span>
      <LayoutGroup id={id}>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-labelledby={`${id}-label`} onKeyDown={onKeyDown}>
          {topics.map((topic, index) => (
            <button key={topic} ref={(node) => { refs.current[index] = node }} type="button" role="radio" aria-checked={topic === value} tabIndex={topic === value ? 0 : -1} className="relative rounded-full px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={() => onChange(topic)}>
              {topic === value ? <motion.span layoutId={`${id}-topic`} className="absolute inset-0 -z-10 rounded-full bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.morph} aria-hidden /> : null}
              <span className="relative">{topic}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>
    </div>
  )
}

function ContactForm({ topics, onSubmit, reduced, className }: { topics: string[]; onSubmit?: ContactSectionProps["onSubmit"]; reduced: boolean; className?: string }) {
  const formId = useId()
  const [values, setValues] = useState({ name: "", email: "", message: "" })
  const [topic, setTopic] = useState(topics[0] ?? "")
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [phase, setPhase] = useState<"editing" | "sending" | "sent">("editing")
  const [failure, setFailure] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState({ name: "", email: "" })
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const restoreFocus = useRef(false)

  useEffect(() => {
    if (phase === "sent") successRef.current?.focus()
    if (phase === "editing" && restoreFocus.current) {
      restoreFocus.current = false
      nameRef.current?.focus()
    }
  }, [phase])

  function update(field: keyof typeof values) {
    return (event: { target: { value: string } }) => {
      const next = { ...values, [field]: event.target.value }
      setValues(next)
      if (submitted) setErrors(validate(next))
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (phase !== "editing") return
    setSubmitted(true)
    setFailure(null)
    const found = validate(values)
    setErrors(found)
    if (found.name) { nameRef.current?.focus(); return }
    if (found.email) { emailRef.current?.focus(); return }
    if (found.message) { messageRef.current?.focus(); return }
    setPhase("sending")
    const payload = { name: values.name.trim(), email: values.email.trim(), topic, message: values.message.trim() }
    try {
      await (onSubmit ? onSubmit(payload) : new Promise((resolve) => setTimeout(resolve, 900)))
      setSentTo({ name: payload.name.split(/\s+/)[0] ?? payload.name, email: payload.email })
      setPhase("sent")
    } catch {
      setPhase("editing")
      setFailure("We couldn't send your message. Check your connection and try again.")
    }
  }

  function reset() {
    setValues({ name: "", email: "", message: "" })
    setErrors({})
    setSubmitted(false)
    setFailure(null)
    restoreFocus.current = true
    setPhase("editing")
  }

  const left = MAX_MESSAGE - values.message.length
  return (
    <div data-slot="contact-form" className={cn("rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <AnimatePresence initial={false}>
        {phase === "sent" ? (
          <motion.div key="sent" className="grid justify-items-start gap-3" aria-live="polite" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0 } }}>
            <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary" aria-hidden>
              <Check />
            </span>
            <h3 ref={successRef} tabIndex={-1} className="text-xl font-medium outline-none">Thanks, {sentTo.name}</h3>
            <p className="text-sm text-pretty text-muted-foreground">Your message is with the {topic.toLowerCase() || "studio"} team. We’ll reply to {sentTo.email} within one business day.</p>
            <Button type="button" variant="outline" onClick={reset}>Send another message</Button>
          </motion.div>
        ) : (
          <motion.form key="form" className="grid gap-4" onSubmit={submit} noValidate aria-label="Contact form" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`${formId}-name`}>Name</Label>
                <Input ref={nameRef} id={`${formId}-name`} name="name" autoComplete="name" placeholder="Your name" value={values.name} onChange={update("name")} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? `${formId}-name-error` : undefined} readOnly={phase === "sending"} />
                {errors.name ? <p id={`${formId}-name-error`} role="alert" className="text-xs text-destructive">{errors.name}</p> : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${formId}-email`}>Work email</Label>
                <Input ref={emailRef} id={`${formId}-email`} name="email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={values.email} onChange={update("email")} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? `${formId}-email-error` : undefined} readOnly={phase === "sending"} />
                {errors.email ? <p id={`${formId}-email-error`} role="alert" className="text-xs text-destructive">{errors.email}</p> : null}
              </div>
            </div>
            {topics.length > 0 ? <TopicPicker topics={topics} value={topic} onChange={setTopic} reduced={reduced} /> : null}
            <div className="grid gap-1.5">
              <Label htmlFor={`${formId}-message`}>Message</Label>
              <Textarea ref={messageRef} id={`${formId}-message`} name="message" rows={4} maxLength={MAX_MESSAGE} placeholder="What are you making?" value={values.message} onChange={update("message")} aria-invalid={errors.message ? true : undefined} aria-describedby={`${formId}-message-help`} readOnly={phase === "sending"} />
              <p id={`${formId}-message-help`} className={cn("text-xs text-muted-foreground", errors.message && "text-destructive")}>{errors.message ?? `${left} characters left`}</p>
            </div>
            {failure ? <p role="alert" className="text-sm text-destructive">{failure}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">We reply within one business day.</p>
              <Button type="submit" aria-busy={phase === "sending" || undefined} disabled={phase === "sending"}>Send message</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConfirmAction({ idle, busy, done, note }: { idle: string; busy?: boolean; done: string; note?: ReactNode }) {
  const reduced = useReducedMotion() ?? false
  const [state, setState] = useState<"idle" | "busy" | "done">("idle")
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <div className="grid justify-items-start gap-2">
      <Button
        type="button"
        variant={state === "done" ? "outline" : "default"}
        aria-busy={state === "busy" || undefined}
        disabled={state === "busy"}
        onClick={() => {
          if (state !== "idle") { setState("idle"); return }
          if (busy) {
            setState("busy")
            timer.current = window.setTimeout(() => setState("done"), 800)
          } else setState("done")
        }}
      >
        {state === "done" ? <><Check aria-hidden />{done}</> : idle}
      </Button>
      <div aria-live="polite">
        <AnimatePresence initial={false}>
          {state === "done" && note ? (
            <motion.div key="note" className="text-sm text-muted-foreground" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {note}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

async function copyValue(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

function CopyText({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={() => {
        void copyValue(value).then((ok) => {
          if (!ok) return
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1600)
        })
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  )
}

export const contactExampleChannels: ContactChannel[] = [
  {
    value: "chat",
    label: "Chat with the studio",
    meta: "Replies in a few minutes",
    icon: <MessageCircle {...ICON} />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Chat with the studio</h3>
        <p className="text-sm text-pretty text-muted-foreground">Someone at the bench can answer a quick question about a glaze, a size, or an order.</p>
        <ConfirmAction idle="Start a chat" busy done="Chat started" note={<span className="inline-flex items-center gap-2"><Avatar size="sm"><AvatarFallback>SC</AvatarFallback></Avatar><span><strong>Studio lead</strong> joined the chat.</span></span>} />
      </>
    ),
  },
  {
    value: "email",
    label: "Email the studio",
    meta: "Replies within a business day",
    icon: <Mail {...ICON} />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Email the studio</h3>
        <p className="text-sm text-pretty text-muted-foreground">Send photos or a link. A person reads every message.</p>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span className="break-all">studio@example.com</span><CopyText value="studio@example.com" label="Copy email" /></div>
      </>
    ),
  },
  {
    value: "call",
    label: "Request a call",
    meta: "Weekdays, 9am to 6pm",
    icon: <Phone {...ICON} />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Request a call</h3>
        <p className="text-sm text-pretty text-muted-foreground">Wholesale, a large set, or a visit. The call is about twenty minutes.</p>
        <div className="flex flex-wrap items-center gap-2 text-sm"><span>+1 (415) 555-0132</span><CopyText value="+14155550132" label="Copy number" /></div>
        <ConfirmAction idle="Request a call" busy done="Call requested" note="We’ll email a few times that work this week." />
      </>
    ),
  },
  {
    value: "community",
    label: "Ask the workshop",
    meta: "Open to past students",
    icon: <Users {...ICON} />,
    detail: (
      <>
        <h3 className="text-lg font-medium">Ask the workshop</h3>
        <p className="text-sm text-pretty text-muted-foreground">People who have thrown here answer questions about clay and firing.</p>
        <ConfirmAction idle="Open the forum" done="Forum opened" note="The forum opens on the live site." />
      </>
    ),
  },
]

export const contactExampleOffices: ContactOffice[] = [
  { city: "Oaxaca", timeZone: "America/Mexico_City", address: ["Calle del Estudio 10", "Oaxaca, México"], email: "oaxaca@example.com" },
  { city: "Mexico City", timeZone: "America/Mexico_City", address: ["Avenida Ejemplo 200", "Ciudad de México"], email: "cdmx@example.com" },
  { city: "Lisbon", timeZone: "Europe/Lisbon", address: ["Rua do Exemplo 10", "Lisboa, Portugal"], email: "lisbon@example.com" },
]

function useNow(intervalMs: number) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const timer = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

function officeState(office: ContactOffice, now: Date | null) {
  if (!now) return { time: "--:--", open: null as boolean | null }
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: office.timeZone, hour: "numeric", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(now)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  const hour = Number(get("hour"))
  const weekday = get("weekday")
  const [start, end] = office.hours ?? [9, 18]
  const time = new Intl.DateTimeFormat("en-US", { timeZone: office.timeZone, hour: "numeric", minute: "2-digit" }).format(now)
  return { time, open: weekday !== "Sat" && weekday !== "Sun" && hour >= start && hour < end }
}

const hourLabel = (hour: number) => `${hour % 12 || 12}${hour < 12 || hour === 24 ? "am" : "pm"}`

function Offices({ offices, className }: { offices: ContactOffice[]; className?: string }) {
  const now = useNow(15000)
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {offices.map((office) => {
        const { time, open } = officeState(office, now)
        return (
          <li key={office.city} className="grid gap-2 rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium">{office.city}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-3.5" aria-hidden /><span className="tabular-nums">{time}</span></span>
            </div>
            <span className="inline-flex items-center gap-2 text-sm" data-open={open ? "" : undefined}>
              <span className={cn("size-2 rounded-full", open ? "bg-primary" : "bg-muted-foreground")} aria-hidden />
              {open === null ? "Checking hours" : open ? `Open until ${hourLabel((office.hours ?? [9, 18])[1])}` : "Closed now"}
            </span>
            <address className="grid text-sm text-muted-foreground not-italic">
              {office.address.map((line) => <span key={line}>{line}</span>)}
            </address>
            <div className="flex flex-wrap items-center gap-2">
              {office.email ? <a className="text-sm break-all underline-offset-4 hover:underline" href={`mailto:${office.email}`}>{office.email}</a> : null}
              <CopyText value={office.address.join(", ")} label="Copy address" />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Channels({ channels, value, onChange, reduced, className }: { channels: ContactChannel[]; value: string; onChange: (value: string) => void; reduced: boolean; className?: string }) {
  const id = useId()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const active = channels.find((channel) => channel.value === value) ?? channels[0]
  const choose = (next: string) => {
    if (!active || next === active.value) return
    onChange(next)
  }
  function onKeyDown(event: KeyboardEvent) {
    if (!active) return
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0
    const edge = event.key === "Home" ? 0 : event.key === "End" ? channels.length - 1 : -1
    if (!delta && edge < 0) return
    event.preventDefault()
    const next = edge >= 0 ? edge : (channels.indexOf(active) + delta + channels.length) % channels.length
    choose(channels[next].value)
    refs.current[next]?.focus()
  }
  if (!active) return null
  return (
    <div className={cn("grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]", className)}>
      <LayoutGroup id={id}>
        <div className="grid content-start gap-1" role="tablist" aria-orientation="vertical" aria-label="Ways to reach us" onKeyDown={onKeyDown}>
          {channels.map((channel, index) => {
            const selected = channel.value === active.value
            return (
              <button key={channel.value} ref={(node) => { refs.current[index] = node }} type="button" role="tab" id={`${id}-tab-${channel.value}`} aria-selected={selected} aria-controls={`${id}-panel`} tabIndex={selected ? 0 : -1} className="relative flex min-h-14 items-center gap-3 rounded-lg px-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={() => choose(channel.value)}>
                {selected ? <motion.span layoutId={`${id}-channel`} className="absolute inset-0 -z-10 rounded-lg bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.morph} aria-hidden /> : null}
                <span className="relative text-muted-foreground">{channel.icon}</span>
                <span className="relative grid min-w-0">
                  <span className="text-sm font-medium">{channel.label}</span>
                  <span className="truncate text-xs text-muted-foreground">{channel.meta}</span>
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active.value}`} className="grid content-start gap-3 rounded-xl border border-border p-4">
        <motion.div key={active.value} className="grid gap-3" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : motionPresets.duration.standard }}>
          {active.detail}
        </motion.div>
      </div>
    </div>
  )
}

/**
 * A contact section: a validated form that becomes a confirmation, a list of ways to reach the studio,
 * or office cards with the local time.
 */
export const ContactSection = forwardRef<HTMLElement, ContactSectionProps>(function ContactSection({
  variant = "form",
  title,
  description,
  topics = ["Sales", "Support", "Partnerships", "Press"],
  onSubmit,
  channels = contactExampleChannels,
  channel: channelProp,
  defaultChannel,
  onChannelChange,
  offices = contactExampleOffices,
  className,
  classNames,
}, ref) {
  const id = useId()
  const reduced = useReducedMotion() ?? false
  const [innerChannel, setInnerChannel] = useState(defaultChannel ?? channels[0]?.value ?? "")
  const activeChannel = channelProp ?? innerChannel
  const setChannel = (next: string) => {
    if (channelProp === undefined) setInnerChannel(next)
    onChannelChange?.(next)
  }
  const copy = {
    form: { title: "Talk to the studio", description: "A question about a piece, a firing, or an order. A person reads every message." },
    channels: { title: "Get in touch", description: "Pick whatever suits the question. Every channel reaches the same small team." },
    offices: { title: "Visit the studio", description: "Write before you come. Someone is usually at the wheel." },
  }[variant]

  return (
    <section ref={ref} data-slot="contact-section" data-variant={variant} className={cn("@container w-full min-w-0 text-foreground", className, classNames?.root)} aria-labelledby={`${id}-title`}>
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className={cn("grid content-start gap-3", classNames?.intro)}>
          <h2 id={`${id}-title`} className="text-2xl font-medium tracking-tight text-balance break-words">{title ?? copy.title}</h2>
          <p className="text-sm text-pretty break-words text-muted-foreground">{description ?? copy.description}</p>
          {variant === "form" ? (
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-2"><Clock className="size-4" aria-hidden />Replies within one business day</li>
              <li className="inline-flex min-w-0 flex-wrap items-center gap-2"><Mail className="size-4" aria-hidden /><span className="break-all">hello@example.com</span><CopyText value="hello@example.com" label="Copy email" /></li>
            </ul>
          ) : null}
        </div>
        {variant === "form" ? <ContactForm topics={topics} onSubmit={onSubmit} reduced={reduced} className={classNames?.form} /> : null}
        {variant === "channels" ? <Channels channels={channels} value={activeChannel} onChange={setChannel} reduced={reduced} className={cn("lg:col-span-2", classNames?.channels)} /> : null}
        {variant === "offices" ? <Offices offices={offices} className={cn("lg:col-span-2", classNames?.offices)} /> : null}
      </div>
    </section>
  )
})
