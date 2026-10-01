"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import type { Transition, Variants } from "motion/react"
import { Check, ChevronRight, CornerDownRight, RotateCcw, SmilePlus, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface CommentAuthor {
  id: string
  name: string
  /** Square image URL. Initials are shown without one. */
  avatar?: string
}

export interface CommentReaction {
  emoji: string
  /** Ids of the people who reacted. */
  users: string[]
}

export interface ThreadComment {
  id: string
  author: CommentAuthor
  /** Plain text. "@Full Name" mentions of known people are highlighted. */
  body: string
  /** Display label such as "2h" or "Sep 18". */
  createdAt: string
  edited?: boolean
  /** A deleted comment that still has replies keeps its place as a quiet placeholder. */
  deleted?: boolean
  reactions?: CommentReaction[]
  replies?: ThreadComment[]
}

/** What changed. `comments` on `onCommentsChange` is always the full next tree. */
export type CommentThreadEvent =
  | { type: "reply"; comment: ThreadComment; parentId: string | null }
  | { type: "edit"; id: string; body: string }
  | { type: "delete"; id: string }
  | { type: "react"; id: string; emoji: string; added: boolean }

/**
 * A threaded discussion. Replies nest and collapse, reactions toggle, authors edit and delete
 * their own comments, mentions autocomplete, and resolving folds the thread into a chip.
 */
export interface CommentThreadProps {
  comments?: ThreadComment[]
  defaultComments?: ThreadComment[]
  onCommentsChange?: (comments: ThreadComment[], event: CommentThreadEvent) => void
  /** The person writing. Their comments can be edited and deleted. */
  currentUser: CommentAuthor
  /** People who can be mentioned. Defaults to everyone in the thread. */
  people?: CommentAuthor[]
  resolved?: boolean
  defaultResolved?: boolean
  onResolvedChange?: (resolved: boolean) => void
  /** What the thread is about, shown in its header. */
  title?: ReactNode
  /** Emoji offered by the reaction picker. */
  reactions?: string[]
  placeholder?: string
  /** Replies deeper than this attach to the deepest allowed parent. Defaults to 2. */
  maxDepth?: number
  /** Label for comments written now. */
  nowLabel?: string
  className?: string
  classNames?: CommentThreadClassNames
}

export type CommentThreadClassNames = {
  root?: string
  header?: string
  list?: string
  comment?: string
  body?: string
  composer?: string
  resolved?: string
}

type Bezier = [number, number, number, number]
const enter = [...motionPresets.ease.enter] as Bezier
const standard = [...motionPresets.ease.standard] as Bezier
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}
const HEIGHT = physical(0.42, 0)
const DEFAULT_REACTIONS = ["👍", "❤️", "🎉", "👀", "🚀", "✅"]
const quietActions = "[@media(hover:hover)_and_(pointer:fine)]:!opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/comment:!opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within/comment:!opacity-100"

const subscribe = () => () => {}
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

const mapTree = (list: ThreadComment[], id: string, fn: (comment: ThreadComment) => ThreadComment | null): ThreadComment[] =>
  list.flatMap((comment) => {
    if (comment.id === id) {
      const next = fn(comment)
      return next ? [next] : []
    }
    return comment.replies?.length ? [{ ...comment, replies: mapTree(comment.replies, id, fn) }] : [comment]
  })

const countTree = (list: ThreadComment[]): number => list.reduce((sum, comment) => sum + (comment.deleted ? 0 : 1) + countTree(comment.replies ?? []), 0)

const authorsOf = (list: ThreadComment[], into = new Map<string, CommentAuthor>()) => {
  list.forEach((comment) => {
    if (!comment.deleted) into.set(comment.author.id, comment.author)
    authorsOf(comment.replies ?? [], into)
  })
  return into
}

const pathTo = (list: ThreadComment[], id: string, trail: string[] = []): string[] | null => {
  for (const comment of list) {
    if (comment.id === id) return [...trail, id]
    const found = pathTo(comment.replies ?? [], id, [...trail, comment.id])
    if (found) return found
  }
  return null
}

const findComment = (list: ThreadComment[], id: string): ThreadComment | null => {
  for (const comment of list) {
    if (comment.id === id) return comment
    const found = findComment(comment.replies ?? [], id)
    if (found) return found
  }
  return null
}

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
let serial = 0
const newId = () => `c-${Date.now().toString(36)}-${(serial++).toString(36)}`

function PersonAvatar({ author, className }: { author: CommentAuthor; className?: string }) {
  return (
    <Avatar className={cn("size-7 text-[10px]", className)}>
      {author.avatar ? <AvatarImage src={author.avatar} alt="" /> : null}
      <AvatarFallback className="text-[10px] font-medium">{initials(author.name)}</AvatarFallback>
    </Avatar>
  )
}

function Body({ text, people, className }: { text: string; people: CommentAuthor[]; className?: string }) {
  const parts = useMemo(() => {
    const names = people.map((person) => person.name).sort((a, b) => b.length - a.length).map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    if (!names.length) return [text]
    return text.split(new RegExp(`(@(?:${names.join("|")}))`, "g"))
  }, [people, text])
  return (
    <p data-slot="comment-thread-body" className={cn("m-0 wrap-anywhere whitespace-pre-wrap text-muted-foreground", className)}>
      {parts.map((part, index) => (index % 2 ? <span key={index} data-slot="comment-thread-mention" className="font-medium text-primary">{part}</span> : part))}
    </p>
  )
}

const roll: Variants = {
  hidden: (dir: number) => ({ y: `${dir * 70}%`, opacity: 0 }),
  shown: { y: 0, opacity: 1 },
  gone: (dir: number) => ({ y: `${dir * -70}%`, opacity: 0 }),
}
const rollReduced: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1 }, gone: { opacity: 0 } }

function Count({ value, reduced }: { value: number; reduced: boolean }) {
  const [last, setLast] = useState(value)
  const [dir, setDir] = useState(1)
  if (value !== last) {
    setDir(value > last ? 1 : -1)
    setLast(value)
  }
  return (
    <span className="relative inline-grid min-w-[1ch] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={value}
          custom={dir}
          className="col-start-1 row-start-1"
          variants={reduced ? rollReduced : roll}
          initial="hidden"
          animate="shown"
          exit="gone"
          transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function AutoHeight({ children, reduced, morphKey }: { children: ReactNode; reduced: boolean; morphKey: string }) {
  const inner = useRef<HTMLDivElement>(null)
  const height = useMotionValue(0)
  const [measured, setMeasured] = useState(false)
  const morphing = useRef(false)
  const lastKey = useRef(morphKey)
  useLayoutEffect(() => {
    if (lastKey.current !== morphKey) {
      lastKey.current = morphKey
      morphing.current = true
    }
  }, [morphKey])
  useLayoutEffect(() => {
    const node = inner.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight
      if (morphing.current && !reduced) {
        morphing.current = false
        animate(height, next, HEIGHT)
        return
      }
      if (height.isAnimating()) {
        animate(height, next, HEIGHT)
        return
      }
      height.jump(next)
      setMeasured(true)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [height, reduced])
  return (
    <motion.div className="overflow-hidden rounded-[inherit]" style={{ height: measured ? height : "auto" }}>
      <div ref={inner} className="relative">{children}</div>
    </motion.div>
  )
}

interface ComposerProps {
  people: CommentAuthor[]
  initial?: string
  placeholder: string
  submitLabel: string
  autoFocus?: boolean
  focusKey?: number
  onSubmit: (body: string) => void
  onCancel?: () => void
  leading?: ReactNode
  compact?: boolean
  className?: string
}

function Composer({ people, initial = "", placeholder, submitLabel, autoFocus, focusKey, onSubmit, onCancel, leading, compact, className }: ComposerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const field = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState(initial)
  const [query, setQuery] = useState<{ start: number; term: string } | null>(null)
  const [active, setActive] = useState(0)
  const suggestions = useMemo(() => {
    if (!query) return []
    const term = query.term.toLowerCase()
    return people.filter((person) => person.name.toLowerCase().split(" ").some((part) => part.startsWith(term)) || person.name.toLowerCase().startsWith(term)).slice(0, 5)
  }, [people, query])
  const open = !!query && suggestions.length > 0

  useEffect(() => {
    if (!autoFocus && !focusKey) return
    const node = field.current
    if (!node) return
    node.focus({ preventScroll: true })
    node.setSelectionRange(node.value.length, node.value.length)
  }, [autoFocus, focusKey])

  const readQuery = (value: string, caret: number) => {
    const match = /(^|\s)@([\p{L}]*)$/u.exec(value.slice(0, caret))
    setQuery(match ? { start: caret - match[2].length - 1, term: match[2] } : null)
    setActive(0)
  }

  const insert = (person: CommentAuthor) => {
    const node = field.current
    if (!node || !query) return
    const caret = node.selectionStart ?? text.length
    const next = `${text.slice(0, query.start)}@${person.name} ${text.slice(caret)}`
    const at = query.start + person.name.length + 2
    setText(next)
    setQuery(null)
    requestAnimationFrame(() => {
      node.focus()
      node.setSelectionRange(at, at)
    })
  }

  const send = () => {
    const body = text.trim()
    if (!body) return
    onSubmit(body)
    setText("")
    setQuery(null)
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length)
        return
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault()
        insert(suggestions[active])
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        setQuery(null)
        return
      }
    }
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      send()
      return
    }
    if (event.key === "Escape" && onCancel) {
      event.preventDefault()
      event.stopPropagation()
      onCancel()
    }
  }

  return (
    <div data-slot="comment-thread-composer" data-compact={compact || undefined} className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-2 max-[420px]:grid-cols-[minmax(0,1fr)_auto] data-[compact]:grid-cols-1", className)}>
      {leading}
      <div className="grid min-w-0">
        <Textarea
          ref={field}
          value={text}
          placeholder={placeholder}
          rows={1}
          aria-label={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${uid}-people`}
          aria-activedescendant={open ? `${uid}-person-${active}` : undefined}
          className="max-h-40 min-h-[38px] resize-none rounded-xl px-3 py-2 text-sm shadow-none"
          onChange={(event) => {
            setText(event.target.value)
            readQuery(event.target.value, event.target.selectionStart)
          }}
          onSelect={(event) => readQuery(event.currentTarget.value, event.currentTarget.selectionStart)}
          onBlur={() => setQuery(null)}
          onKeyDown={onKeyDown}
        />
        <AnimatePresence>
          {open ? (
            <motion.ul
              key="people"
              id={`${uid}-people`}
              role="listbox"
              aria-label="People"
              className="mt-1.5 grid list-none overflow-clip rounded-xl border border-border bg-popover p-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.12, ease: standard } }}
              transition={{ height: HEIGHT, opacity: { duration: 0.16, ease: enter } }}
            >
              {suggestions.map((person, index) => (
                <li
                  key={person.id}
                  id={`${uid}-person-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className="flex min-h-8 cursor-pointer items-center gap-2 rounded-lg px-2 aria-selected:bg-muted"
                  onPointerDown={(event) => event.preventDefault()}
                  onPointerMove={() => setActive(index)}
                  onClick={() => insert(person)}
                >
                  <PersonAvatar author={person} className="size-5" />
                  {person.name}
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>
      <div className={cn("flex items-center gap-1", compact && "justify-end")}>
        {onCancel ? <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onCancel}>Cancel</Button> : null}
        <Button type="button" size="sm" className="rounded-full" disabled={!text.trim() || text.trim() === initial.trim()} onClick={send}>{submitLabel}</Button>
      </div>
    </div>
  )
}

type Ui = { editing: string | null; confirming: string | null; picker: string | null; collapsed: Record<string, boolean> }

export const CommentThread = forwardRef<HTMLElement, CommentThreadProps>(function CommentThread({
  comments,
  defaultComments = [],
  onCommentsChange,
  currentUser,
  people,
  resolved,
  defaultResolved = false,
  onResolvedChange,
  title,
  reactions = DEFAULT_REACTIONS,
  placeholder = "Reply, or @mention someone",
  maxDepth = 2,
  nowLabel = "Just now",
  className,
  classNames,
}, forwardedRef) {
  const reduced = useReducedFlag()
  const rootRef = useRef<HTMLElement>(null)
  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLElement)
  const [internal, setInternal] = useState(defaultComments)
  const list = comments ?? internal
  const [internalResolved, setInternalResolved] = useState(defaultResolved)
  const isResolved = resolved ?? internalResolved
  const [ui, setUi] = useState<Ui>({ editing: null, confirming: null, picker: null, collapsed: {} })
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [focusKey, setFocusKey] = useState(0)

  const mentionable = useMemo(() => people ?? [...authorsOf(list, new Map([[currentUser.id, currentUser]])).values()], [currentUser, list, people])
  const total = countTree(list)
  const participants = useMemo(() => [...authorsOf(list).values()], [list])

  const commit = useCallback((next: ThreadComment[], event: CommentThreadEvent) => {
    if (comments === undefined) setInternal(next)
    onCommentsChange?.(next, event)
  }, [comments, onCommentsChange])

  const setResolved = (next: boolean) => {
    if (resolved === undefined) setInternalResolved(next)
    onResolvedChange?.(next)
    setUi((current) => ({ ...current, editing: null, confirming: null, picker: null }))
    setReplyTo(null)
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(next ? "[data-reopen]" : "[data-resolve]")?.focus({ preventScroll: true }))
  }

  const addReply = (body: string) => {
    const comment: ThreadComment = { id: newId(), author: currentUser, body, createdAt: nowLabel, reactions: [] }
    let parentId: string | null = null
    if (replyTo) {
      const path = pathTo(list, replyTo.id) ?? []
      parentId = path[Math.min(path.length, maxDepth) - 1] ?? null
    }
    const next = parentId ? mapTree(list, parentId, (parent) => ({ ...parent, replies: [...(parent.replies ?? []), comment] })) : [...list, comment]
    if (parentId) setUi((current) => ({ ...current, collapsed: { ...current.collapsed, [parentId]: false } }))
    commit(next, { type: "reply", comment, parentId })
    setReplyTo(null)
  }

  const edit = (id: string, body: string) => {
    commit(mapTree(list, id, (comment) => ({ ...comment, body, edited: true })), { type: "edit", id, body })
    setUi((current) => ({ ...current, editing: null }))
  }

  const remove = (id: string) => {
    commit(mapTree(list, id, (comment) => (comment.replies?.length ? { ...comment, deleted: true, body: "", reactions: [] } : null)), { type: "delete", id })
    setUi((current) => ({ ...current, confirming: null }))
    if (replyTo?.id === id) setReplyTo(null)
  }

  const react = (id: string, emoji: string) => {
    const target = findComment(list, id)
    if (!target) return
    const existing = target.reactions?.find((reaction) => reaction.emoji === emoji)
    const added = !existing?.users.includes(currentUser.id)
    const nextReactions = existing
      ? (target.reactions ?? []).map((reaction) => reaction.emoji !== emoji ? reaction : { ...reaction, users: added ? [...reaction.users, currentUser.id] : reaction.users.filter((user) => user !== currentUser.id) }).filter((reaction) => reaction.users.length)
      : [...(target.reactions ?? []), { emoji, users: [currentUser.id] }]
    commit(mapTree(list, id, (comment) => ({ ...comment, reactions: nextReactions })), { type: "react", id, emoji, added })
    setUi((current) => ({ ...current, picker: null }))
  }

  const grow = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { height: HEIGHT, opacity: { duration: 0.2, ease: enter } } }

  const renderComment = (comment: ThreadComment, depth: number): ReactNode => {
    const mine = comment.author.id === currentUser.id
    const replies = comment.replies ?? []
    const collapsed = !!ui.collapsed[comment.id]
    const editing = ui.editing === comment.id
    const confirming = ui.confirming === comment.id
    const picking = ui.picker === comment.id
    const replyCount = countTree(replies)
    return (
      <motion.li key={comment.id} className="overflow-clip" {...grow}>
        <article data-slot="comment-thread-comment" aria-label={comment.deleted ? "Deleted comment" : `${comment.author.name}, ${comment.createdAt}`} className={cn("group/comment flex gap-2.5 rounded-2xl p-2.5", classNames?.comment)}>
          {comment.deleted ? <span className="size-7 shrink-0 rounded-full border border-dashed border-border" aria-hidden="true" /> : <PersonAvatar author={comment.author} />}
          <div className="grid min-w-0 flex-1 gap-0.5">
            {comment.deleted ? (
              <p className="mt-1 text-muted-foreground italic">This comment was deleted</p>
            ) : (
              <>
                <header className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate font-medium">{comment.author.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{comment.createdAt}{comment.edited ? " · edited" : ""}</span>
                </header>
                {editing ? (
                  <Composer
                    people={mentionable}
                    initial={comment.body}
                    placeholder="Edit comment"
                    submitLabel="Save"
                    autoFocus
                    compact
                    className={classNames?.composer}
                    onSubmit={(body) => edit(comment.id, body)}
                    onCancel={() => setUi((current) => ({ ...current, editing: null }))}
                  />
                ) : (
                  <Body text={comment.body} people={mentionable} className={classNames?.body} />
                )}
                {!editing ? (
                  <div className="mt-1 flex min-h-[30px] flex-wrap items-center gap-x-2 gap-y-1">
                    {(comment.reactions ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <AnimatePresence initial={false} mode="popLayout">
                          {(comment.reactions ?? []).map((reaction) => {
                            const pressed = reaction.users.includes(currentUser.id)
                            return (
                              <motion.button
                                key={reaction.emoji}
                                type="button"
                                layout={!reduced}
                                aria-pressed={pressed}
                                aria-label={`${reaction.emoji} ${reaction.users.length}${pressed ? ", including you" : ""}`}
                                className="inline-flex h-[26px] items-center gap-1 rounded-full border border-border bg-background px-2 text-xs font-medium text-muted-foreground aria-pressed:border-ring aria-pressed:bg-accent aria-pressed:text-foreground"
                                onClick={() => react(comment.id, reaction.emoji)}
                                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
                                transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}
                              >
                                <span aria-hidden="true">{reaction.emoji}</span>
                                <Count value={reaction.users.length} reduced={reduced} />
                              </motion.button>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    ) : null}
                    <AnimatePresence mode="wait" initial={false}>
                      {confirming ? (
                        <motion.div
                          key="confirm"
                          data-open=""
                          className="flex min-h-7 flex-wrap items-center gap-0.5"
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.16, ease: enter }}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.stopPropagation()
                              setUi((current) => ({ ...current, confirming: null }))
                            }
                          }}
                        >
                          <span className="mr-1 text-xs">Delete this comment?</span>
                          <Button type="button" variant="ghost" size="xs" onClick={() => setUi((current) => ({ ...current, confirming: null }))}>Cancel</Button>
                          <Button type="button" variant="destructive" size="xs" autoFocus onClick={() => remove(comment.id)}>Delete</Button>
                        </motion.div>
                      ) : picking ? (
                        <motion.div
                          key="picker"
                          role="group"
                          aria-label="Reactions"
                          data-open=""
                          className="flex min-h-7 flex-wrap items-center gap-0.5"
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.stopPropagation()
                              setUi((current) => ({ ...current, picker: null }))
                            }
                          }}
                          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                          transition={{ duration: 0.16, ease: enter }}
                        >
                          {reactions.map((emoji, index) => (
                            <motion.button
                              key={emoji}
                              type="button"
                              autoFocus={index === 0}
                              aria-label={`React with ${emoji}`}
                              aria-pressed={!!comment.reactions?.find((reaction) => reaction.emoji === emoji)?.users.includes(currentUser.id)}
                              className="grid size-8 place-items-center rounded-full text-base aria-pressed:bg-accent"
                              onClick={() => react(comment.id, emoji)}
                              initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ ...motionPresets.spring.snappy, delay: index * motionPresets.stagger.item }}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                          <Button type="button" variant="ghost" size="icon-xs" aria-label="Close reactions" onClick={() => setUi((current) => ({ ...current, picker: null }))}>
                            <X aria-hidden="true" />
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="actions"
                          className={cn("flex min-h-7 flex-wrap items-center gap-0.5", quietActions)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12, ease: standard }}
                        >
                          <Button type="button" variant="ghost" size="icon-xs" aria-label="Add reaction" onClick={() => setUi((current) => ({ ...current, picker: comment.id, confirming: null }))}>
                            <SmilePlus aria-hidden="true" />
                          </Button>
                          <Button type="button" variant="ghost" size="xs" onClick={() => { setReplyTo({ id: comment.id, name: comment.author.name }); setFocusKey((key) => key + 1) }}>Reply</Button>
                          {mine ? <Button type="button" variant="ghost" size="xs" onClick={() => setUi((current) => ({ ...current, editing: comment.id, confirming: null, picker: null }))}>Edit</Button> : null}
                          {mine ? <Button type="button" variant="ghost" size="xs" className="text-destructive hover:text-destructive" onClick={() => setUi((current) => ({ ...current, confirming: comment.id, editing: null, picker: null }))}>Delete</Button> : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : null}
              </>
            )}
            {replies.length > 0 ? (
              <button
                type="button"
                className="mt-0.5 -ml-1.5 inline-flex h-7 w-fit items-center gap-1.5 rounded-full px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-expanded={!collapsed}
                onClick={() => setUi((current) => ({ ...current, collapsed: { ...current.collapsed, [comment.id]: !collapsed } }))}
              >
                <motion.span className="grid place-items-center text-muted-foreground" initial={false} animate={{ rotate: collapsed ? 0 : 90 }} transition={reduced ? { duration: 0 } : motionPresets.spring.snappy} aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </motion.span>
                {collapsed ? `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}` : "Hide replies"}
                {collapsed ? (
                  <span className="inline-flex pl-1" aria-hidden="true">
                    {[...authorsOf(replies).values()].slice(0, 3).map((author) => (
                      <PersonAvatar key={author.id} author={author} className="size-[18px] ring-2 ring-card not-first:-ml-1" />
                    ))}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </article>
        <AnimatePresence initial={false}>
          {replies.length > 0 && !collapsed ? (
            <motion.div key="replies" className="overflow-clip" {...grow}>
              <ul className="relative ml-6 list-none border-l border-border py-0 pr-0 pl-3 max-[420px]:ml-3" data-depth={depth + 1}>
                <AnimatePresence initial={false}>{replies.map((reply) => renderComment(reply, depth + 1))}</AnimatePresence>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.li>
    )
  }

  const face = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionPresets.blur.subtle}px)` },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: reduced ? "blur(0px)" : `blur(${motionPresets.blur.subtle}px)` },
    transition: { duration: 0.2, ease: enter },
  }

  return (
    <section ref={rootRef} data-slot="comment-thread" data-resolved={isResolved || undefined} aria-label="Comment thread" className={cn("w-full min-w-0 rounded-xl border border-border bg-card text-sm text-card-foreground data-[resolved]:rounded-3xl", className, classNames?.root)}>
      <AutoHeight reduced={reduced} morphKey={isResolved ? "resolved" : "thread"}>
        <AnimatePresence mode="popLayout" initial={false}>
          {isResolved ? (
            <motion.div key="resolved" data-slot="comment-thread-resolved" className={cn("flex items-center gap-3 px-3.5 py-2.5", classNames?.resolved)} {...face}>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-primary" aria-hidden="true">
                <Check className="size-3.5" />
              </span>
              <span className="grid min-w-0 flex-1">
                <span className="truncate font-medium">
                  Resolved
                  {title ? <> · <span className="font-normal text-muted-foreground">{title}</span></> : null}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {total} {total === 1 ? "comment" : "comments"} · {participants.length} {participants.length === 1 ? "person" : "people"}
                </span>
              </span>
              <span className="inline-flex shrink-0" aria-hidden="true">
                {participants.slice(0, 3).map((author) => (
                  <PersonAvatar key={author.id} author={author} className="size-[22px] ring-2 ring-card not-first:-ml-1.5" />
                ))}
              </span>
              <Button type="button" variant="outline" size="sm" data-reopen className="rounded-full" onClick={() => setResolved(false)}>
                <RotateCcw aria-hidden="true" />
                Reopen
              </Button>
            </motion.div>
          ) : (
            <motion.div key="thread" className="grid" {...face}>
              <header data-slot="comment-thread-header" className={cn("flex items-center justify-between gap-3 px-4 pt-3 pb-2", classNames?.header)}>
                <div className="grid min-w-0">
                  {title ? <h3 className="truncate text-sm font-medium">{title}</h3> : null}
                  <span className="text-xs text-muted-foreground tabular-nums">{total} {total === 1 ? "comment" : "comments"}</span>
                </div>
                <Button type="button" variant="outline" size="sm" data-resolve className="rounded-full" disabled={!total} onClick={() => setResolved(true)}>
                  <Check aria-hidden="true" />
                  Resolve
                </Button>
              </header>
              {list.length > 0 ? (
                <ul data-slot="comment-thread-list" className={cn("grid list-none px-2", classNames?.list)}>
                  <AnimatePresence initial={false}>{list.map((comment) => renderComment(comment, 0))}</AnimatePresence>
                </ul>
              ) : (
                <p className="px-4 pt-2 pb-4 text-muted-foreground">No comments yet. Start the conversation below.</p>
              )}
              <div className="mt-1 grid border-t border-border px-3 pt-2.5 pb-3">
                <AnimatePresence initial={false}>
                  {replyTo ? (
                    <motion.div key="replying" className="overflow-clip" {...grow}>
                      <span className="flex items-center gap-1.5 px-0.5 pb-2 pl-9 text-xs text-muted-foreground max-[420px]:pl-0.5">
                        <CornerDownRight className="size-3.5" aria-hidden="true" />
                        <span>Replying to <span className="font-medium text-foreground">{replyTo.name}</span></span>
                        <Button type="button" variant="ghost" size="icon-xs" aria-label="Cancel reply" onClick={() => setReplyTo(null)}>
                          <X aria-hidden="true" />
                        </Button>
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <Composer
                  people={mentionable}
                  placeholder={placeholder}
                  submitLabel="Send"
                  focusKey={focusKey}
                  className={classNames?.composer}
                  onSubmit={addReply}
                  onCancel={replyTo ? () => setReplyTo(null) : undefined}
                  leading={<PersonAvatar author={currentUser} className="mt-1 max-[420px]:hidden" />}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AutoHeight>
    </section>
  )
})
