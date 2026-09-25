"use client"

import { useState } from "react"

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        })
      }}
      className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.96]"
    >
      {copied ? "Copied" : label}
    </button>
  )
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-1.5">
        {label ? (
          <p className="truncate font-mono text-xs text-muted-foreground">{label}</p>
        ) : (
          <span />
        )}
        <CopyButton value={code} />
      </div>
      <pre className="max-h-[32rem] overflow-auto p-4 text-xs leading-5">
        <code>{code}</code>
      </pre>
    </div>
  )
}
