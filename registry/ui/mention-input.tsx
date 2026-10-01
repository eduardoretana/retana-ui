"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react"
import type { Transition } from "motion/react"
import { Hash } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type MentionKind = "person" | "channel"

export interface MentionPerson {
  id: string
  name: string
  role?: string
  avatar?: string
}

export interface MentionChannel {
  id: string
  name: string
  description?: string
  members?: number
}

/** A mention inside `text`. `start` and `end` are character offsets. */
export interface Mention {
  kind: MentionKind
  id: string
  label: string
  start: number
  end: number
}

export interface MentionValue {
  text: string
  mentions: Mention[]
}

export interface MentionInputHandle {
  focus: () => void
  insert: (text: string) => void
  openSuggestions: (kind: MentionKind) => void
  clear: () => void
  textarea: HTMLTextAreaElement | null
}

export type MentionInputClassNames = {
  root?: string
  field?: string
  textarea?: string
  popover?: string
  token?: string
}

export interface MentionInputProps {
  value?: MentionValue
  defaultValue?: MentionValue
  onChange?: (value: MentionValue) => void
  people?: MentionPerson[]
  channels?: MentionChannel[]
  onMentionAdd?: (mention: Mention) => void
  onSubmit?: (value: MentionValue) => void
  submitOnEnter?: boolean
  placeholder?: string
  minRows?: number
  maxRows?: number
  placement?: "auto" | "top" | "bottom"
  maxSuggestions?: number
  disabled?: boolean
  name?: string
  id?: string
  "aria-label"?: string
  "aria-describedby"?: string
  className?: string
  classNames?: MentionInputClassNames
}

type Suggestion = { kind: "person"; item: MentionPerson } | { kind: "channel"; item: MentionChannel }
type Trigger = { kind: MentionKind; start: number; query: string }

const EMPTY: MentionValue = { text: "", mentions: [] }
const SYMBOL: Record<MentionKind, string> = { person: "@", channel: "#" }
const POPOVER_WIDTH = 272
const { spring, duration, ease } = motionPresets
const enter = [...ease.enter] as [number, number, number, number]
const standard = [...ease.standard] as [number, number, number, number]
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}
const GLIDE = physical(0.3, 0.1)
const GROW = physical(spring.smooth.visualDuration, 0)

export const mentionText = (kind: MentionKind, label: string) => `${SYMBOL[kind]}${label}`

/** Turns a value into storage friendly text, `<@id>` for people and `<#id>` for channels by default. */
export function serializeMentions(value: MentionValue, format: (mention: Mention) => string = (mention) => `<${SYMBOL[mention.kind]}${mention.id}>`) {
  let out = ""
  let at = 0
  for (const mention of [...value.mentions].sort((a, b) => a.start - b.start)) {
    out += value.text.slice(at, mention.start) + format(mention)
    at = mention.end
  }
  return out + value.text.slice(at)
}

function reconcile(previous: MentionValue, text: string, hint: number): Mention[] {
  const a = previous.text
  let prefix = 0
  const maxPrefix = Math.min(a.length, text.length, Math.max(0, hint))
  while (prefix < maxPrefix && a[prefix] === text[prefix]) prefix++
  let suffix = 0
  while (suffix < a.length - prefix && suffix < text.length - prefix && a[a.length - 1 - suffix] === text[text.length - 1 - suffix]) suffix++
  const oldEnd = a.length - suffix
  const delta = text.length - a.length
  return previous.mentions
    .flatMap((mention) => {
      if (mention.end <= prefix) return [mention]
      if (mention.start >= oldEnd) return [{ ...mention, start: mention.start + delta, end: mention.end + delta }]
      return []
    })
    .filter((mention) => text.slice(mention.start, mention.end) === mentionText(mention.kind, mention.label))
}

function findTrigger(text: string, caret: number, mentions: Mention[], kinds: Record<MentionKind, boolean>): Trigger | null {
  for (let index = caret - 1; index >= 0 && index >= caret - 48; index--) {
    const char = text[index]
    if (char === "\n") return null
    if (char !== "@" && char !== "#") continue
    const kind: MentionKind = char === "@" ? "person" : "channel"
    if (!kinds[kind]) return null
    if (index > 0 && !/[\s([{"']/.test(text[index - 1])) return null
    if (mentions.some((mention) => index >= mention.start && index < mention.end)) return null
    const query = text.slice(index + 1, caret)
    const shape = kind === "person" ? /^[^\s@#]*( [^\s@#]*)?$/ : /^[^\s@#]*$/
    return shape.test(query) ? { kind, start: index, query } : null
  }
  return null
}

function rank(label: string, extra: string, query: string) {
  const name = label.toLowerCase()
  if (!query) return 1
  if (name.startsWith(query)) return 4
  if (name.split(/[\s\-_.]+/).some((word) => word.startsWith(query))) return 3
  if (name.includes(query)) return 2
  return extra.toLowerCase().includes(query) ? 1 : 0
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent text-foreground">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  )
}

/**
 * A textarea with `@` people and `#` channel mentions. Mentions are atomic: the caret steps over them and one Backspace removes the whole token.
 */
export const MentionInput = React.forwardRef<MentionInputHandle, MentionInputProps>(function MentionInput(
  {
    value: valueProp,
    defaultValue,
    onChange,
    people,
    channels,
    onMentionAdd,
    onSubmit,
    submitOnEnter = false,
    placeholder,
    minRows = 1,
    maxRows = 8,
    placement = "auto",
    maxSuggestions = 6,
    disabled,
    name,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    className,
    classNames,
  },
  ref,
) {
  const reduced = !!useReducedMotion()
  const uid = React.useId()
  const listId = `${uid}-list`
  const [inner, setInner] = React.useState<MentionValue>(defaultValue ?? EMPTY)
  const value = valueProp ?? inner
  const live = React.useRef(value)
  React.useLayoutEffect(() => {
    live.current = value
  })

  const rootRef = React.useRef<HTMLDivElement>(null)
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const areaRef = React.useRef<HTMLTextAreaElement>(null)
  const backdropRef = React.useRef<HTMLDivElement>(null)
  const lastCaret = React.useRef(0)
  const pending = React.useRef<Mention | null>(null)

  const [caret, setCaret] = React.useState<number | null>(null)
  const [focused, setFocused] = React.useState(false)
  const [dismissed, setDismissed] = React.useState<number | null>(null)
  const [active, setActive] = React.useState(0)

  const commit = React.useCallback(
    (next: MentionValue) => {
      if (valueProp === undefined) setInner(next)
      onChange?.(next)
    },
    [onChange, valueProp],
  )

  const kinds = React.useMemo(() => ({ person: !!people?.length, channel: !!channels?.length }), [channels, people])
  const trigger = React.useMemo(() => (caret === null ? null : findTrigger(value.text, caret, value.mentions, kinds)), [caret, kinds, value.mentions, value.text])

  const suggestions = React.useMemo<Suggestion[]>(() => {
    if (!trigger) return []
    const query = trigger.query.toLowerCase().trim()
    const scored: { entry: Suggestion; score: number }[] =
      trigger.kind === "person"
        ? (people ?? []).map((item) => ({ entry: { kind: "person" as const, item }, score: rank(item.name, item.role ?? "", query) }))
        : (channels ?? []).map((item) => ({ entry: { kind: "channel" as const, item }, score: rank(item.name, item.description ?? "", query) }))
    return scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map((entry) => entry.entry)
  }, [channels, maxSuggestions, people, trigger])

  const open = focused && !disabled && !!trigger && trigger.start !== dismissed && (suggestions.length > 0 || !trigger.query.includes(" "))
  const activeIndex = Math.min(active, Math.max(0, suggestions.length - 1))
  const queryKey = trigger ? `${trigger.start}:${trigger.query}` : ""
  const [lastQueryKey, setLastQueryKey] = React.useState(queryKey)
  if (lastQueryKey !== queryKey) {
    setLastQueryKey(queryKey)
    setActive(0)
  }
  if (dismissed !== null && trigger?.start !== dismissed) setDismissed(null)

  const onSelect = () => {
    const area = areaRef.current
    if (!area) return
    let start = area.selectionStart
    let end = area.selectionEnd
    const collapsed = start === end
    for (const mention of live.current.mentions) {
      if (collapsed && start > mention.start && start < mention.end) {
        const stepped = Math.abs(start - lastCaret.current) === 1
        const forward = start > lastCaret.current
        start = end = stepped ? (forward ? mention.end : mention.start) : start - mention.start < mention.end - start ? mention.start : mention.end
      } else if (!collapsed) {
        if (start > mention.start && start < mention.end) start = mention.start
        if (end > mention.start && end < mention.end) end = mention.end
      }
    }
    if (start !== area.selectionStart || end !== area.selectionEnd) area.setSelectionRange(start, end, area.selectionDirection)
    lastCaret.current = area.selectionStart
    setCaret(collapsed ? start : null)
  }

  const onInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value
    const mentions = reconcile(live.current, text, lastCaret.current)
    const added = pending.current
    pending.current = null
    if (added && text.slice(added.start, added.end) === mentionText(added.kind, added.label)) {
      mentions.push(added)
      mentions.sort((a, b) => a.start - b.start)
    }
    const next = { text, mentions }
    live.current = next
    commit(next)
    if (added) onMentionAdd?.(added)
    lastCaret.current = event.target.selectionStart
    setCaret(event.target.selectionStart === event.target.selectionEnd ? event.target.selectionStart : null)
  }

  const typeText = React.useCallback(
    (text: string, from?: number, to?: number) => {
      const area = areaRef.current
      if (!area) return
      area.focus({ preventScroll: true })
      if (from !== undefined) area.setSelectionRange(from, to ?? from)
      lastCaret.current = area.selectionStart
      const typed = typeof document.execCommand === "function" && document.execCommand("insertText", false, text)
      if (typed) return
      const start = area.selectionStart
      const end = area.selectionEnd
      const current = live.current
      const nextText = current.text.slice(0, start) + text + current.text.slice(end)
      const mentions = reconcile(current, nextText, start)
      const added = pending.current
      pending.current = null
      if (added) mentions.push(added)
      mentions.sort((a, b) => a.start - b.start)
      const next = { text: nextText, mentions }
      live.current = next
      commit(next)
      if (added) onMentionAdd?.(added)
      requestAnimationFrame(() => {
        area.setSelectionRange(start + text.length, start + text.length)
        setCaret(start + text.length)
      })
    },
    [commit, onMentionAdd],
  )

  const choose = (suggestion: Suggestion | undefined) => {
    if (!suggestion || !trigger || caret === null) return
    const label = suggestion.item.name
    const token = mentionText(suggestion.kind, label)
    pending.current = { kind: suggestion.kind, id: suggestion.item.id, label, start: trigger.start, end: trigger.start + token.length }
    const after = value.text[caret]
    typeText(after === undefined || !/\s/.test(after) ? `${token} ` : token, trigger.start, caret)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const area = event.currentTarget
    lastCaret.current = area.selectionStart
    if (open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        if (suggestions.length) setActive((activeIndex + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length)
        return
      }
      if ((event.key === "Enter" || event.key === "Tab") && suggestions.length && !event.shiftKey) {
        event.preventDefault()
        choose(suggestions[activeIndex])
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        setDismissed(trigger?.start ?? null)
        return
      }
    }
    const start = area.selectionStart
    const end = area.selectionEnd
    if (start === end && !event.metaKey && (event.key === "Backspace" || event.key === "Delete")) {
      const hit = live.current.mentions.find((mention) => (event.key === "Backspace" ? start > mention.start && start <= mention.end : start >= mention.start && start < mention.end))
      if (hit) area.setSelectionRange(hit.start, hit.end)
      return
    }
    if (event.key === "Enter" && submitOnEnter && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (live.current.text.trim()) onSubmit?.(live.current)
    }
  }

  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => areaRef.current?.focus(),
      insert: (text) => typeText(text),
      openSuggestions: (kind) => {
        const area = areaRef.current
        if (!area) return
        const at = document.activeElement === area ? area.selectionStart : live.current.text.length
        const before = live.current.text[at - 1]
        setDismissed(null)
        typeText(`${before && !/\s/.test(before) ? " " : ""}${SYMBOL[kind]}`, at, document.activeElement === area ? area.selectionEnd : at)
      },
      clear: () => {
        commit(EMPTY)
        live.current = EMPTY
        setCaret(0)
      },
      get textarea() {
        return areaRef.current
      },
    }),
    [commit, typeText],
  )

  const height = useMotionValue<number | "auto">("auto")
  const [limits, setLimits] = React.useState({ min: 0, max: Infinity })
  const measured = React.useRef(false)
  React.useLayoutEffect(() => {
    const backdrop = backdropRef.current
    if (!backdrop) return
    const style = getComputedStyle(backdrop)
    const line = parseFloat(style.lineHeight) || 24
    const pad = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const next = { min: line * minRows + pad, max: line * Math.max(minRows, maxRows) + pad }
    setLimits((current) => (current.min === next.min && current.max === next.max ? current : next))
  }, [maxRows, minRows])
  React.useLayoutEffect(() => {
    const backdrop = backdropRef.current
    if (!backdrop || !limits.min) return
    const fit = () => {
      const target = Math.min(limits.max, Math.max(limits.min, backdrop.offsetHeight))
      const current = height.get()
      if (!measured.current || reduced || typeof current !== "number") {
        height.jump(target)
        measured.current = true
        return
      }
      if (Math.abs(current - target) > 0.5) animate(height, target, GROW)
    }
    fit()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(fit)
    observer.observe(backdrop)
    return () => observer.disconnect()
  }, [height, limits, reduced])

  const [anchor, setAnchor] = React.useState<{ x: number; y: number; line: number; above: boolean } | null>(null)
  const measureAnchor = React.useCallback(() => {
    const marker = backdropRef.current?.querySelector<HTMLElement>("[data-anchor]")
    const root = rootRef.current
    const field = fieldRef.current
    const area = areaRef.current
    if (!marker || !root || !field || !area) {
      setAnchor(null)
      return
    }
    const line = parseFloat(getComputedStyle(marker.parentElement ?? marker).lineHeight) || 24
    const x = Math.max(0, Math.min(field.offsetLeft + marker.offsetLeft - 10, root.offsetWidth - POPOVER_WIDTH))
    const top = field.offsetTop + marker.offsetTop - area.scrollTop
    const box = root.getBoundingClientRect()
    const roomBelow = window.innerHeight - (box.top + top + line)
    const above = placement === "top" || (placement === "auto" && roomBelow < 300 && box.top + top > roomBelow)
    const y = above ? top - 6 : top + line + 6
    setAnchor((current) => (current && current.x === x && current.y === y && current.above === above && current.line === line ? current : { x, y, line, above }))
  }, [placement])
  React.useLayoutEffect(() => {
    if (open) measureAnchor()
  }, [measureAnchor, open, trigger?.start, value.text])

  const onScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const backdrop = backdropRef.current
    if (backdrop) backdrop.style.transform = `translateY(${-event.currentTarget.scrollTop}px)`
    measureAnchor()
  }

  const listRef = React.useRef<HTMLUListElement>(null)
  const hy = useMotionValue(0)
  const hh = useMotionValue(0)
  const panelHeight = useMotionValue<number | "auto">("auto")
  React.useLayoutEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    if (!row) return
    if (reduced || hh.get() === 0) {
      hy.jump(row.offsetTop)
      hh.jump(row.offsetHeight)
      return
    }
    animate(hy, row.offsetTop, GLIDE)
    animate(hh, row.offsetHeight, GLIDE)
  }, [activeIndex, hh, hy, open, reduced, suggestions])
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const panelSized = React.useRef(false)
  React.useLayoutEffect(() => {
    if (!open) {
      panelSized.current = false
      hh.jump(0)
      return
    }
    const body = bodyRef.current
    if (!body) return
    const fit = () => {
      const target = body.offsetHeight
      if (!panelSized.current || reduced) {
        panelHeight.jump(target)
        panelSized.current = true
        return
      }
      animate(panelHeight, target, GROW)
    }
    fit()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(fit)
    observer.observe(body)
    return () => observer.disconnect()
  }, [hh, open, panelHeight, reduced, trigger?.start])

  const mirror = React.useMemo(() => {
    const parts: React.ReactNode[] = []
    const markAt = open && trigger ? trigger.start : -1
    let at = 0
    const pushText = (from: number, to: number) => {
      if (markAt >= from && markAt < to) {
        parts.push(value.text.slice(from, markAt), <span key="anchor" data-anchor="" />, value.text.slice(markAt, to))
      } else parts.push(value.text.slice(from, to))
    }
    for (const mention of value.mentions) {
      pushText(at, mention.start)
      parts.push(
        <span
          key={`${mention.start}-${mention.id}`}
          data-kind={mention.kind}
          className={cn(
            "-mx-[3px] rounded-md px-[3px] py-px",
            mention.kind === "channel" ? "bg-muted text-foreground" : "bg-accent text-accent-foreground",
            classNames?.token,
          )}
        >
          {value.text.slice(mention.start, mention.end)}
        </span>,
      )
      at = mention.end
    }
    pushText(at, value.text.length)
    return parts
  }, [classNames?.token, open, trigger, value.mentions, value.text])

  const optionId = (index: number) => `${uid}-option-${index}`
  const popIn = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: anchor?.above ? 4 : -4 }
  const countLabel = open ? (suggestions.length ? `${suggestions.length} ${trigger?.kind === "person" ? (suggestions.length === 1 ? "person" : "people") : suggestions.length === 1 ? "channel" : "channels"}` : "No matches") : ""

  return (
    <div ref={rootRef} data-slot="mention-input" className={cn("relative w-full min-w-0 text-foreground", disabled && "opacity-55", className, classNames?.root)} data-disabled={disabled || undefined}>
      <motion.div
        ref={fieldRef}
        data-slot="mention-input-field"
        data-focused={focused || undefined}
        className={cn("relative overflow-hidden rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50", classNames?.field)}
        style={{ height }}
      >
        <div ref={backdropRef} className="pointer-events-none absolute top-0 left-0 box-border w-full px-3.5 py-2.5 text-base leading-6 wrap-break-word whitespace-pre-wrap" aria-hidden="true">
          {mirror}
          {"\u200b"}
        </div>
        <Textarea
          ref={areaRef}
          id={id}
          name={name}
          data-slot="mention-input-textarea"
          className={cn(
            "absolute inset-0 h-full min-h-0 resize-none field-sizing-fixed overflow-y-auto border-0 bg-transparent px-3.5 py-2.5 text-base leading-6 text-transparent shadow-none wrap-break-word whitespace-pre-wrap caret-foreground outline-none focus-visible:ring-0 md:text-base dark:bg-transparent",
            "[-webkit-text-fill-color:transparent] placeholder:text-muted-foreground placeholder:[-webkit-text-fill-color:var(--color-muted-foreground)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            classNames?.textarea,
          )}
          value={value.text}
          placeholder={placeholder}
          disabled={disabled}
          rows={minRows}
          spellCheck
          role="combobox"
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && suggestions.length ? optionId(activeIndex) : undefined}
          onChange={onInput}
          onSelect={onSelect}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            setCaret(null)
          }}
        />
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {countLabel}
      </span>
      <AnimatePresence>
        {open && anchor ? (
          <motion.div
            key={trigger?.start}
            data-slot="mention-input-popover"
            data-above={anchor.above || undefined}
            className={cn(
              "absolute z-30 w-[272px] max-w-full overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
              anchor.above && "-translate-y-full",
              classNames?.popover,
            )}
            style={{ left: anchor.x, top: anchor.y, height: panelHeight, transformOrigin: anchor.above ? "14px 100%" : "14px 0" }}
            initial={popIn}
            animate={{ opacity: 1, scale: 1, y: 0, transition: reduced ? { duration: duration.fast } : { ...spring.snappy, opacity: { duration: duration.fast, ease: enter } } }}
            exit={{ ...popIn, transition: { duration: duration.exit * 0.7, ease: standard } }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <div ref={bodyRef} className="p-1.5">
              {suggestions.length ? (
                <ul ref={listRef} id={listId} role="listbox" aria-label={trigger?.kind === "person" ? "People" : "Channels"} className="relative m-0 grid list-none p-0">
                  <motion.li aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-accent" style={{ y: hy, height: hh }} />
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={`${suggestion.kind}-${suggestion.item.id}`}
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === activeIndex}
                      data-index={index}
                      className="relative flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg py-1.5 pr-2.5 pl-2 text-sm"
                      onPointerMove={() => {
                        if (index !== activeIndex) setActive(index)
                      }}
                      onClick={() => choose(suggestion)}
                    >
                      {suggestion.kind === "person" ? (
                        <Avatar className="size-7" aria-hidden="true">
                          {suggestion.item.avatar ? <AvatarImage src={suggestion.item.avatar} alt="" /> : null}
                          <AvatarFallback className="text-[11px]">{initials(suggestion.item.name)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <span className="grid size-7 shrink-0 place-items-center text-muted-foreground" aria-hidden="true">
                          <Hash className="size-4" />
                        </span>
                      )}
                      <span className="grid min-w-0 flex-1">
                        <span className={cn("truncate font-medium", index === activeIndex ? "text-foreground" : "text-muted-foreground")}>
                          <Highlight text={suggestion.item.name} query={trigger?.query.trim() ?? ""} />
                        </span>
                        {suggestion.kind === "person"
                          ? suggestion.item.role && <span className="truncate text-xs text-muted-foreground">{suggestion.item.role}</span>
                          : suggestion.item.description && <span className="truncate text-xs text-muted-foreground">{suggestion.item.description}</span>}
                      </span>
                      {suggestion.kind === "channel" && suggestion.item.members !== undefined ? <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{suggestion.item.members}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 px-2.5 py-2.5 text-sm text-muted-foreground">No {trigger?.kind === "person" ? "people" : "channels"} match “{trigger?.query}”</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
})
