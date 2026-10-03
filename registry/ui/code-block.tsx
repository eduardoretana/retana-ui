"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CodeTokenType = "plain" | "keyword" | "string" | "comment" | "number" | "function"

export type CodeToken = {
  type: CodeTokenType
  value: string
}

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while", "switch",
  "case", "break", "continue", "import", "export", "from", "as", "async", "await",
  "class", "extends", "new", "try", "catch", "throw", "typeof", "interface", "type",
  "public", "private", "true", "false", "null", "undefined", "void", "of", "in",
  "default", "yield", "this",
])

function isIdent(char: string) {
  return /[A-Za-z0-9_$]/.test(char)
}

export function highlightLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = []
  let index = 0

  function push(type: CodeTokenType, value: string) {
    if (value) tokens.push({ type, value })
  }

  while (index < line.length) {
    const rest = line.slice(index)
    if (rest.startsWith("//")) {
      push("comment", rest)
      break
    }
    const char = line[index]
    if (char === '"' || char === "'" || char === "`") {
      let end = index + 1
      while (end < line.length && line[end] !== char) {
        if (line[end] === "\\") end += 1
        end += 1
      }
      end = Math.min(line.length, end + 1)
      push("string", line.slice(index, end))
      index = end
      continue
    }
    if (/\d/.test(char) && (index === 0 || !isIdent(line[index - 1]))) {
      let end = index + 1
      while (end < line.length && /[\d.]/.test(line[end])) end += 1
      push("number", line.slice(index, end))
      index = end
      continue
    }
    if (/[A-Za-z_$]/.test(char)) {
      let end = index + 1
      while (end < line.length && isIdent(line[end])) end += 1
      const word = line.slice(index, end)
      const next = line.slice(end).match(/^\s*\(/)
      if (KEYWORDS.has(word)) push("keyword", word)
      else if (next) push("function", word)
      else push("plain", word)
      index = end
      continue
    }
    push("plain", char)
    index += 1
  }
  return tokens
}

const TOKEN_CLASS: Record<CodeTokenType, string> = {
  plain: "",
  keyword: "font-medium text-primary",
  string: "text-foreground/80 underline decoration-primary/40 underline-offset-2",
  comment: "text-muted-foreground italic",
  number: "tabular-nums",
  function: "font-medium",
}

export type CodeBlockProps = {
  code: string
  filename?: string
  language?: string
  showLineNumbers?: boolean
  /** Collapse longer sources. A control expands the rest in place. */
  maxLines?: number
  copyLabel?: string
  copiedLabel?: string
  expandLabel?: string
  collapseLabel?: string
  className?: string
}

export function CodeBlock({
  code,
  filename,
  language = "text",
  showLineNumbers = true,
  maxLines,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  expandLabel = "Show all lines",
  collapseLabel = "Show fewer lines",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const timer = React.useRef<number>(0)
  const lines = code.replace(/\n$/, "").split("\n")
  const collapsed = maxLines != null && lines.length > maxLines && !expanded
  const visible = collapsed ? lines.slice(0, maxLines) : lines

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure
      data-slot="code-block"
      data-language={language}
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
    >
      <figcaption className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-xs">{filename ?? language}</span>
        <span className="text-[11px] text-muted-foreground uppercase">{language}</span>
        <Button type="button" variant="ghost" size="xs" onClick={() => void copy()} aria-label={copied ? copiedLabel : copyLabel}>
          {copied ? <Check /> : <Copy />}
          {copied ? copiedLabel : copyLabel}
        </Button>
      </figcaption>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-6">
        <code>
          {visible.map((line, index) => (
            <span key={index} className="flex">
              {showLineNumbers ? (
                <span className="mr-4 w-6 shrink-0 select-none text-right text-muted-foreground tabular-nums" aria-hidden>
                  {index + 1}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 whitespace-pre">
                {line.length === 0
                  ? " "
                  : highlightLine(line).map((token, tokenIndex) => (
                      <span key={tokenIndex} className={TOKEN_CLASS[token.type]}>
                        {token.value}
                      </span>
                    ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {maxLines != null && lines.length > maxLines ? (
        <div className="border-t border-border px-3 py-1.5">
          <Button type="button" variant="ghost" size="xs" aria-expanded={expanded} onClick={() => setExpanded((current) => !current)}>
            {expanded ? collapseLabel : expandLabel}
          </Button>
        </div>
      ) : null}
    </figure>
  )
}
