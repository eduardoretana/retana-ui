"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type StreamingTextProps = {
  text: string
  /** When true, a caret stays visible after the revealed text. */
  streaming?: boolean
  /** Reveal the full string immediately. */
  animate?: boolean
  cursorLabel?: string
  className?: string
}

type Inline =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string }

function safeHref(href: string) {
  const trimmed = href.trim()
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed
  return null
}

function parseInline(source: string): Inline[] {
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g
  const nodes: Inline[] = []
  let cursor = 0
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > cursor) nodes.push({ type: "text", value: source.slice(cursor, index) })
    if (match[2]) nodes.push({ type: "bold", value: match[2] })
    else if (match[3]) nodes.push({ type: "italic", value: match[3] })
    else if (match[4]) nodes.push({ type: "code", value: match[4] })
    else if (match[5] && match[6]) nodes.push({ type: "link", label: match[5], href: match[6] })
    cursor = index + match[0].length
  }
  if (cursor < source.length) nodes.push({ type: "text", value: source.slice(cursor) })
  return nodes
}

function InlineRun({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, index) => {
        const key = `${part.type}-${index}`
        if (part.type === "bold") return <strong key={key}>{part.value}</strong>
        if (part.type === "italic") return <em key={key}>{part.value}</em>
        if (part.type === "code") {
          return (
            <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
              {part.value}
            </code>
          )
        }
        if (part.type === "link") {
          const href = safeHref(part.href)
          if (!href) return <span key={key}>{part.label}</span>
          return (
            <a key={key} href={href} className="underline underline-offset-2" rel="noreferrer" target="_blank">
              {part.label}
            </a>
          )
        }
        return <React.Fragment key={key}>{part.value}</React.Fragment>
      })}
    </>
  )
}

function Markdown({ source }: { source: string }) {
  const lines = source.split("\n")
  const blocks: React.ReactNode[] = []
  let list: string[] = []
  let paragraph: string[] = []

  function flushParagraph() {
    if (!paragraph.length) return
    const text = paragraph.join(" ")
    blocks.push(
      <p key={`p-${blocks.length}`} className="whitespace-pre-wrap">
        <InlineRun parts={parseInline(text)} />
      </p>,
    )
    paragraph = []
  }

  function flushList() {
    if (!list.length) return
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pl-5">
        {list.map((item, index) => (
          <li key={index}>
            <InlineRun parts={parseInline(item)} />
          </li>
        ))}
      </ul>,
    )
    list = []
  }

  for (const line of lines) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    const item = /^[-*]\s+(.+)$/.exec(line)
    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1].length
      const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4"
      blocks.push(
        <Tag key={`h-${blocks.length}`} className="font-semibold tracking-tight">
          <InlineRun parts={parseInline(heading[2])} />
        </Tag>,
      )
      continue
    }
    if (item) {
      flushParagraph()
      list.push(item[1])
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }
    flushList()
    paragraph.push(line)
  }
  flushParagraph()
  flushList()
  return <div className="flex flex-col gap-2">{blocks}</div>
}

export function StreamingText({
  text,
  streaming = false,
  animate = true,
  cursorLabel = "Generating",
  className,
}: StreamingTextProps) {
  const [shown, setShown] = React.useState(animate ? "" : text)
  const shownRef = React.useRef(shown)

  React.useEffect(() => {
    if (!animate) return
    let frame = 0
    const step = () => {
      const current = shownRef.current
      if (current === text) return
      if (!text.startsWith(current)) {
        shownRef.current = text
        setShown(text)
        return
      }
      const gap = text.length - current.length
      const take = Math.max(1, Math.ceil(gap / 30))
      const next = text.slice(0, current.length + take)
      shownRef.current = next
      setShown(next)
      if (next !== text) frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [animate, text])

  const visible = animate ? shown : text
  const caret = streaming || (animate && visible.length < text.length)

  return (
    <div data-slot="streaming-text" data-streaming={caret ? "true" : "false"} className={cn("text-sm leading-relaxed", className)}>
      <Markdown source={visible} />
      {caret ? (
        <span className="ml-0.5 inline-flex translate-y-0.5 items-center" aria-hidden>
          <span className="inline-block h-4 w-px bg-foreground motion-safe:animate-pulse" />
        </span>
      ) : null}
      {caret ? <span className="sr-only">{cursorLabel}</span> : null}
    </div>
  )
}
