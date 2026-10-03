"use client"

/** Adapted from Arc UI (MIT). */

import { useId, useState } from "react"
import type { KeyboardEvent, MouseEvent } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

import { blogCategories, blogPosts } from "./blog-grid-data"
import type { BlogPost } from "./blog-grid-data"

export type { BlogAuthor, BlogPost } from "./blog-grid-data"

export interface BlogGridProps {
  title?: string
  description?: string
  posts?: BlogPost[]
  /** Category filter labels, in order. "All" is added in front. */
  categories?: string[]
  /** Active category, or "All" (controlled). */
  category?: string
  defaultCategory?: string
  onCategoryChange?: (category: string) => void
  /** One based page (controlled). */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Cards per page below the featured post. Defaults to 6. */
  pageSize?: number
  /** Shows the newest post of the current filter as a large card on page one. Defaults to true. */
  showFeatured?: boolean
  /** Link for each post. When set, cards render as links and the in-place reader is off. */
  getHref?: (post: BlogPost) => string
  /** Called when a post opens, from a link or the in-place reader. */
  onPostOpen?: (post: BlogPost) => void
  className?: string
  classNames?: BlogGridClassNames
}

export type BlogGridClassNames = {
  root?: string
  header?: string
  title?: string
  filters?: string
  grid?: string
  card?: string
  featured?: string
  reader?: string
  pagination?: string
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`))

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(initial)
  const current = value !== undefined ? value : inner
  const set = (next: T) => {
    if (value === undefined) setInner(next)
    onChange?.(next)
  }
  return [current, set] as const
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

function moveFocus(event: KeyboardEvent<HTMLButtonElement>, values: string[], current: string, select: (value: string) => void) {
  const index = Math.max(0, values.indexOf(current))
  const next =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? values[(index + 1) % values.length]
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? values[(index - 1 + values.length) % values.length]
        : event.key === "Home"
          ? values[0]
          : event.key === "End"
            ? values[values.length - 1]
            : null
  if (!next) return
  event.preventDefault()
  select(next)
  event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(next)}"]`)?.focus()
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <p data-slot="blog-grid-meta" className="m-0 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{post.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
    </p>
  )
}

function Byline({ post }: { post: BlogPost }) {
  return (
    <div data-slot="blog-grid-byline" className="mt-2 flex min-w-0 items-center gap-2 text-sm">
      <Avatar size="sm">
        {post.author.avatar ? <AvatarImage src={post.author.avatar} alt="" /> : null}
        <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate">{post.author.name}</span>
      <span className="shrink-0 text-muted-foreground">· {post.readTime} min read</span>
    </div>
  )
}

/**
 * A filterable journal: category chips, a featured card, paged notes, and an in-place reader that returns focus to the card you opened.
 */
export function BlogGrid({
  title = "Journal",
  description = "Product news, design notes and engineering deep dives from the team.",
  posts = blogPosts,
  categories = blogCategories,
  category: categoryProp,
  defaultCategory = "All",
  onCategoryChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 6,
  showFeatured = true,
  getHref,
  onPostOpen,
  className,
  classNames,
}: BlogGridProps) {
  const reduced = !!useReducedMotion()
  const uid = useId()
  const [category, setCategoryState] = useControllable(categoryProp, defaultCategory, onCategoryChange)
  const [page, setPageState] = useControllable(pageProp, defaultPage, onPageChange)
  const [direction, setDirection] = useState(0)
  const [reading, setReading] = useState<BlogPost | null>(null)
  const [lastOpened, setLastOpened] = useState<string | null>(null)

  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date))
  const filtered = category === "All" ? sorted : sorted.filter((post) => post.category === category)
  const featured = showFeatured && filtered.length > 1 ? (filtered.find((post) => post.featured) ?? filtered[0]) : null
  const rest = featured ? filtered.filter((post) => post !== featured) : filtered
  const pageCount = Math.max(1, Math.ceil(rest.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const pagePosts = rest.slice((safePage - 1) * pageSize, safePage * pageSize)
  const tabs = ["All", ...categories]
  const pageKey = `${category}-${safePage}`

  function scrollSection(event: MouseEvent<HTMLElement>) {
    const node = event.currentTarget.closest("section")
    if (node && node.getBoundingClientRect().top < 0) node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })
  }

  function setCategory(next: string) {
    if (next === category) return
    setDirection(0)
    setCategoryState(next)
    setPageState(1)
  }

  function setPage(next: number, event: MouseEvent<HTMLButtonElement>) {
    if (next === safePage || next < 1 || next > pageCount) return
    setDirection(next > safePage ? 1 : -1)
    setPageState(next)
    scrollSection(event)
  }

  function openPost(post: BlogPost, event: MouseEvent<HTMLAnchorElement>) {
    onPostOpen?.(post)
    if (getHref) return
    event.preventDefault()
    setLastOpened(post.id)
    setReading(post)
    scrollSection(event)
  }

  function close(event: MouseEvent<HTMLButtonElement>) {
    const section = event.currentTarget.closest("section")
    const opened = lastOpened
    setReading(null)
    requestAnimationFrame(() => {
      const card = section?.querySelector<HTMLElement>(`[data-post="${CSS.escape(opened ?? "")}"]`)
      card?.focus({ preventScroll: true })
      card?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" })
    })
  }

  const renderCard = (post: BlogPost, isFeatured = false) => {
    const href = getHref?.(post)
    return (
      <a
        key={post.id}
        href={href ?? `#${post.id}`}
        data-slot="blog-grid-card"
        data-post={post.id}
        data-featured={isFeatured ? "" : undefined}
        className={cn(
          "grid min-w-0 content-start gap-4 rounded-xl text-inherit no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isFeatured ? "@min-[680px]/blog:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] @min-[680px]/blog:items-center @min-[680px]/blog:gap-10" : "",
          isFeatured ? classNames?.featured : classNames?.card,
        )}
        onClick={(event) => openPost(post, event)}
      >
        <div className={cn("relative aspect-[3/2] overflow-hidden rounded-xl bg-muted", isFeatured && "@min-[680px]/blog:aspect-[16/10]")}>
          {post.image ? (
            <img className="size-full object-cover motion-safe:transition-transform motion-safe:duration-500 hover:motion-safe:scale-[1.03]" src={post.image.src} alt={post.image.alt} loading={isFeatured ? "eager" : "lazy"} />
          ) : (
            <span className="grid size-full place-items-center text-sm font-medium text-muted-foreground" aria-hidden="true">
              {post.category}
            </span>
          )}
        </div>
        <div className="grid content-start gap-2">
          <Meta post={post} />
          <h3 className={cn("m-0 font-medium text-balance wrap-anywhere", isFeatured ? "font-heading text-2xl tracking-tight @min-[680px]/blog:text-3xl" : "text-lg")}>{post.title}</h3>
          <p className={cn("m-0 line-clamp-2 text-pretty text-sm text-muted-foreground", isFeatured && "line-clamp-3 text-base")}>{post.excerpt}</p>
          <Byline post={post} />
        </div>
      </a>
    )
  }

  return (
    <section
      data-slot="blog-grid"
      className={cn("@container/blog w-full min-w-0 bg-background text-foreground", className, classNames?.root)}
      aria-label={title}
    >
      <LayoutGroup id={uid}>
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-8 @min-[680px]/blog:px-6 @min-[680px]/blog:py-12">
          <AnimatePresence mode="popLayout" initial={false}>
            {reading ? (
              <motion.article
                key="reader"
                data-slot="blog-grid-reader"
                className={cn("mx-auto grid max-w-3xl gap-8", classNames?.reader)}
                aria-labelledby={`${uid}-reader-title`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : motionPresets.duration.exit } }}
                transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.standard] }}
              >
                <button
                  type="button"
                  className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={close}
                  autoFocus
                >
                  <ArrowLeft aria-hidden="true" />
                  All posts
                </button>
                <header className="grid gap-3">
                  <Meta post={reading} />
                  <h2 id={`${uid}-reader-title`} className="m-0 font-heading text-3xl font-medium tracking-tight text-balance wrap-anywhere @min-[680px]/blog:text-4xl">
                    {reading.title}
                  </h2>
                  <Byline post={reading} />
                </header>
                {reading.image ? (
                  <div className="aspect-video overflow-hidden rounded-xl bg-muted">
                    <img className="size-full object-cover" src={reading.image.src} alt={reading.image.alt} />
                  </div>
                ) : null}
                <div className="grid gap-5 text-base text-muted-foreground @min-[680px]/blog:text-lg">
                  <p className="m-0 text-pretty text-foreground">{reading.excerpt}</p>
                  {(reading.body ?? []).map((paragraph) => (
                    <p key={paragraph} className="m-0 text-pretty">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.article>
            ) : (
              <motion.div
                key="index"
                className="grid gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : motionPresets.duration.exit } }}
                transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.standard] }}
              >
                <header data-slot="blog-grid-header" className={cn("grid max-w-xl gap-3", classNames?.header)}>
                  <h2 className={cn("m-0 font-heading text-3xl font-medium tracking-tight text-balance @min-[680px]/blog:text-4xl", classNames?.title)}>{title}</h2>
                  {description ? <p className="m-0 text-pretty text-muted-foreground">{description}</p> : null}
                </header>

                <div
                  data-slot="blog-grid-filters"
                  className={cn("-mx-4 flex gap-0.5 overflow-x-auto px-4 [scrollbar-width:none]", classNames?.filters)}
                  role="group"
                  aria-label="Filter by category"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      data-value={tab}
                      className="relative isolate h-9 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:text-primary-foreground"
                      aria-pressed={tab === category}
                      tabIndex={tab === category ? 0 : -1}
                      onClick={() => setCategory(tab)}
                      onKeyDown={(event) => moveFocus(event, tabs, category, setCategory)}
                    >
                      {tab === category ? (
                        <motion.span
                          layoutId={`${uid}-filter`}
                          className="absolute inset-0 -z-10 rounded-full bg-foreground"
                          transition={reduced ? { duration: 0 } : motionPresets.spring.morph}
                        />
                      ) : null}
                      <span className="relative">{tab}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={pageKey}
                    className="grid gap-10"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 24, y: direction ? 0 : 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -24, transition: { duration: motionPresets.duration.exit, ease: [...motionPresets.ease.standard] } }}
                    transition={{ ...motionPresets.spring.smooth, opacity: { duration: reduced ? 0 : motionPresets.duration.standard } }}
                  >
                    {featured && safePage === 1 ? renderCard(featured, true) : null}
                    {pagePosts.length > 0 ? (
                      <div data-slot="blog-grid-cards" className={cn("grid gap-10 @min-[540px]/blog:grid-cols-2 @min-[900px]/blog:grid-cols-3", classNames?.grid)}>
                        {pagePosts.map((post) => renderCard(post))}
                      </div>
                    ) : null}
                    {filtered.length === 0 ? <p className="m-0 py-16 text-center text-muted-foreground">No posts in {category} yet.</p> : null}
                  </motion.div>
                </AnimatePresence>

                {pageCount > 1 ? (
                  <nav data-slot="blog-grid-pagination" className={cn("flex items-center justify-between gap-3 border-t border-border pt-6", classNames?.pagination)} aria-label="Pagination">
                    <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50" onClick={(event) => setPage(safePage - 1, event)} disabled={safePage === 1} aria-label="Previous page">
                      <ChevronLeft aria-hidden="true" />
                      <span className="hidden @min-[540px]/blog:inline">Previous</span>
                    </button>
                    <div className="flex gap-0.5">
                      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                        <button
                          key={number}
                          type="button"
                          className="relative isolate inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium text-muted-foreground tabular-nums hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=page]:text-foreground"
                          aria-current={number === safePage ? "page" : undefined}
                          aria-label={`Page ${number}`}
                          onClick={(event) => setPage(number, event)}
                        >
                          {number === safePage ? (
                            <motion.span layoutId={`${uid}-page`} className="absolute inset-0 -z-10 rounded-full bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.morph} />
                          ) : null}
                          <span className="relative">{number}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50" onClick={(event) => setPage(safePage + 1, event)} disabled={safePage === pageCount} aria-label="Next page">
                      <span className="hidden @min-[540px]/blog:inline">Next</span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </nav>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  )
}
