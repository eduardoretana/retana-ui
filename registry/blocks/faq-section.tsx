"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useId, useMemo, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { ArrowRight, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type FaqSectionVariant = "accordion" | "columns" | "search"

export type FaqItem = {
  id?: string
  question: string
  answer: string
  category?: string
}

export type FaqSectionClassNames = {
  root?: string
  intro?: string
  list?: string
  item?: string
  rail?: string
  search?: string
}

export type FaqSectionProps = {
  variant?: FaqSectionVariant
  title?: string
  description?: string
  items?: FaqItem[]
  multiple?: boolean
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  category?: string
  onCategoryChange?: (category: string) => void
  query?: string
  onQueryChange?: (query: string) => void
  contact?: { label: string; description?: string; href?: string; onClick?: () => void } | null
  className?: string
  classNames?: FaqSectionClassNames
}

export const faqExampleItems: FaqItem[] = [
  { question: "How long does a firing take?", answer: "A stoneware firing runs about twelve hours, then the kiln cools overnight before anything is unpacked.", category: "Studio" },
  { question: "Can I visit the workshop?", answer: "Yes. The studio in the city is open by appointment on weekdays, and Saturday workshops are listed on the visit page.", category: "Studio" },
  { question: "Do you pack for shipping?", answer: "Every piece leaves in a double box with a note about the clay body. Breakage in transit is replaced.", category: "Orders" },
  { question: "Which clays do you fire?", answer: "The daily work is stoneware. Porcelain is a separate firing a few times a season.", category: "Firing" },
  { question: "How do wholesale orders work?", answer: "Shops order by the set. A minimum is four pieces, and the lead time is the next scheduled firing.", category: "Orders" },
  { question: "Can a piece be repaired?", answer: "Chips along the foot can be ground. A crack through the wall means the piece is retired.", category: "Firing" },
  { question: "Do you take commissions?", answer: "A small number of dinner sets each season. Write with the count, the glaze, and the date you need them.", category: "Orders" },
  { question: "Where are the pieces made?", answer: "Everything is thrown, trimmed, and glazed in the same studio. Nothing is cast off site.", category: "Studio" },
]

const keyOf = (item: FaqItem) => item.id ?? item.question
const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = normalize(query.trim())
  if (!needle) return <>{text}</>
  const haystack = normalize(text)
  const parts: ReactNode[] = []
  let from = 0
  let at = haystack.indexOf(needle)
  while (at >= 0) {
    if (at > from) parts.push(text.slice(from, at))
    parts.push(<mark key={at} className="bg-primary/15 text-foreground">{text.slice(at, at + needle.length)}</mark>)
    from = at + needle.length
    at = haystack.indexOf(needle, from)
  }
  parts.push(text.slice(from))
  return <>{parts}</>
}

function snippet(answer: string, query: string) {
  const at = normalize(answer).indexOf(normalize(query.trim()))
  if (at < 0) return null
  const start = Math.max(0, answer.lastIndexOf(" ", Math.max(0, at - 36)) + 1)
  const end = Math.min(answer.length, at + query.length + 60)
  return `${start > 0 ? "…" : ""}${answer.slice(start, end).trim()}${end < answer.length ? "…" : ""}`
}

function onListKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
  const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-faq-trigger]"))
  const index = triggers.indexOf(document.activeElement as HTMLElement)
  if (index < 0) return
  event.preventDefault()
  const next = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length
  triggers[next]?.focus()
}

function Question({ item, open, onToggle, query = "", reduced, baseId, layout, className }: { item: FaqItem; open: boolean; onToggle: () => void; query?: string; reduced: boolean; baseId: string; layout?: boolean; className?: string }) {
  const key = keyOf(item)
  const safe = `${baseId}-${key.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const hint = query && !open && !normalize(item.question).includes(normalize(query.trim())) ? snippet(item.answer, query) : null
  return (
    <motion.li
      className={cn("border-b border-border", className)}
      data-open={open ? "" : undefined}
      layout={layout && !reduced ? "position" : false}
      initial={layout ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : motionPresets.duration.standard }}
    >
      <h3>
        <button type="button" id={`${safe}-q`} data-faq-trigger="" className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-expanded={open} aria-controls={`${safe}-a`} onClick={onToggle}>
          <span className="min-w-0 text-sm font-medium break-words"><Highlight text={item.question} query={query} /></span>
          <Plus className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", open && "rotate-45")} aria-hidden />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {hint ? (
          <motion.p key="hint" className="overflow-hidden pb-2 text-xs text-muted-foreground" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Highlight text={hint} query={query} />
          </motion.p>
        ) : null}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div key="answer" id={`${safe}-a`} role="region" aria-labelledby={`${safe}-q`} className="overflow-hidden" initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}>
            <p className="pb-4 text-sm text-pretty break-words text-muted-foreground"><Highlight text={item.answer} query={query} /></p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  )
}

function Contact({ contact }: { contact: NonNullable<FaqSectionProps["contact"]> }) {
  const inner = (
    <>
      <span className="grid min-w-0">
        <span className="text-sm font-medium">{contact.label}</span>
        {contact.description ? <span className="text-sm text-muted-foreground">{contact.description}</span> : null}
      </span>
      <ArrowRight className="size-4 shrink-0" aria-hidden />
    </>
  )
  const classes = "mt-6 flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
  if (contact.href) return <a className={classes} href={contact.href} onClick={contact.onClick}>{inner}</a>
  return <button type="button" className={classes} onClick={contact.onClick}>{inner}</button>
}

/**
 * Questions in one accordion, beside a topic rail, or behind a search field.
 * Arrow keys move between questions. Answers open in place.
 */
export const FaqSection = forwardRef<HTMLElement, FaqSectionProps>(function FaqSection({
  variant = "accordion",
  title = "Questions",
  description = "Firing, visits, and how an order leaves the studio.",
  items = faqExampleItems,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  category: categoryProp,
  onCategoryChange,
  query: queryProp,
  onQueryChange,
  contact = { label: "Still have a question?", description: "The studio replies within a day." },
  className,
  classNames,
}, ref) {
  const id = useId()
  const reduced = useReducedMotion() ?? false
  const [innerOpen, setInnerOpen] = useState<string[]>(defaultValue ?? (items[0] ? [keyOf(items[0])] : []))
  const open = value ?? innerOpen
  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category ?? "General"))), [items])
  const [innerCategory, setInnerCategory] = useState(categories[0] ?? "General")
  const activeCategory = categoryProp ?? innerCategory
  const [direction, setDirection] = useState(0)
  const [innerQuery, setInnerQuery] = useState("")
  const query = queryProp ?? innerQuery

  const setOpen = (next: string[]) => {
    if (value === undefined) setInnerOpen(next)
    onValueChange?.(next)
  }
  const toggle = (key: string) => setOpen(open.includes(key) ? open.filter((entry) => entry !== key) : multiple ? [...open, key] : [key])
  const chooseCategory = (next: string) => {
    if (next === activeCategory) return
    setDirection(Math.sign(categories.indexOf(next) - categories.indexOf(activeCategory)))
    if (categoryProp === undefined) setInnerCategory(next)
    onCategoryChange?.(next)
  }
  const setQuery = (next: string) => {
    if (queryProp === undefined) setInnerQuery(next)
    onQueryChange?.(next)
  }

  const needle = normalize(query.trim())
  const results = variant === "search" && needle ? items.filter((item) => normalize(`${item.question} ${item.answer}`).includes(needle)) : items
  const heading = (
    <div className={cn("grid gap-2", classNames?.intro)}>
      <h2 id={`${id}-title`} className="text-2xl font-medium tracking-tight text-balance break-words">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-pretty break-words text-muted-foreground">{description}</p> : null}
    </div>
  )
  const list = (entries: FaqItem[], layout = false) => (
    <ul className={cn("min-w-0", classNames?.list)} onKeyDown={onListKeyDown}>
      <AnimatePresence initial={false}>
        {entries.map((item) => (
          <Question key={keyOf(item)} item={item} open={open.includes(keyOf(item))} onToggle={() => toggle(keyOf(item))} query={variant === "search" ? query : ""} reduced={reduced} baseId={id} layout={layout} className={classNames?.item} />
        ))}
      </AnimatePresence>
    </ul>
  )

  return (
    <section ref={ref} data-slot="faq-section" data-variant={variant} className={cn("@container w-full min-w-0 text-foreground", className, classNames?.root)} aria-labelledby={`${id}-title`}>
      {variant === "accordion" ? (
        <div className="mx-auto grid w-full max-w-2xl gap-6">
          {heading}
          {list(items)}
          {contact ? <Contact contact={contact} /> : null}
        </div>
      ) : null}

      {variant === "columns" ? (
        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className={cn("grid content-start gap-6", classNames?.rail)}>
            {heading}
            <LayoutGroup id={`${id}-rail`}>
              <div className="grid gap-1" role="group" aria-label="Question topics">
                {categories.map((entry) => {
                  const count = items.filter((item) => (item.category ?? "General") === entry).length
                  const selected = entry === activeCategory
                  return (
                    <button key={entry} type="button" className="relative flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-pressed={selected} onClick={() => chooseCategory(entry)}>
                      {selected ? <motion.span layoutId={`${id}-category`} className="absolute inset-0 -z-10 rounded-lg bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.morph} aria-hidden /> : null}
                      <span className="relative min-w-0 truncate">{entry}</span>
                      <span className="relative text-xs text-muted-foreground">{count}</span>
                    </button>
                  )
                })}
              </div>
            </LayoutGroup>
            {contact ? <Contact contact={contact} /> : null}
          </div>
          <div className="min-w-0">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div
                key={activeCategory}
                custom={direction}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: direction * 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: direction * -8 }}
                transition={{ duration: reduced ? 0 : motionPresets.duration.standard }}
              >
                {list(items.filter((item) => (item.category ?? "General") === activeCategory))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : null}

      {variant === "search" ? (
        <div className="mx-auto grid w-full max-w-2xl gap-6">
          {heading}
          <div className={cn("grid gap-2", classNames?.search)}>
            <Label htmlFor={`${id}-search`}>Search questions</Label>
            <Input id={`${id}-search`} type="search" placeholder="Try firing, shipping, or visit" value={query} onChange={(event) => setQuery(event.target.value)} />
            <p className="text-xs text-muted-foreground" aria-live="polite">{needle ? `${results.length} ${results.length === 1 ? "answer" : "answers"}` : `${items.length} questions`}</p>
          </div>
          {list(results, true)}
          <AnimatePresence initial={false}>
            {needle && results.length === 0 ? (
              <motion.div key="empty" className="grid gap-2 rounded-lg border border-dashed border-border p-4" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="text-sm break-words">No answers mention “{query.trim()}”.</p>
                <button type="button" className="w-fit text-sm font-medium underline-offset-4 hover:underline" onClick={() => setQuery("")}>Clear search</button>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {contact ? <Contact contact={contact} /> : null}
        </div>
      ) : null}
    </section>
  )
})
