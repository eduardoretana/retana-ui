"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/input-controls/language-pair-selector/language-pair-selector.tsx

import * as React from "react"
import { ArrowLeftRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type LanguageOption = { code: string; label: string }

const DEFAULTS = ["en", "es", "fr", "de", "pt", "ja", "ar", "zh"]

export function languageOptions(locale = "en", codes = DEFAULTS): LanguageOption[] {
  const names = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames([locale], { type: "language" }) : null
  return [
    { code: "auto", label: "Detect language" },
    ...codes.map((code) => ({ code, label: names?.of(code) ?? code })),
  ]
}

export type LanguagePairProps = {
  from?: string
  to?: string
  defaultFrom?: string
  defaultTo?: string
  onFromChange?: (code: string) => void
  onToChange?: (code: string) => void
  options?: LanguageOption[]
  locale?: string
  className?: string
}

export function LanguagePair({
  from,
  to,
  defaultFrom = "auto",
  defaultTo = "en",
  onFromChange,
  onToChange,
  options,
  locale = "en",
  className,
}: LanguagePairProps) {
  const list = options ?? languageOptions(locale)
  const [fromState, setFromState] = React.useState(defaultFrom)
  const [toState, setToState] = React.useState(defaultTo)
  const [live, setLive] = React.useState("")
  const source = from ?? fromState
  const target = to ?? toState
  const labelOf = (code: string) => list.find((item) => item.code === code)?.label ?? code

  const setFrom = (code: string) => {
    if (from === undefined) setFromState(code)
    onFromChange?.(code)
  }
  const setTo = (code: string) => {
    if (to === undefined) setToState(code)
    onToChange?.(code)
  }

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
      <Select value={source} onValueChange={setFrom}>
        <SelectTrigger aria-label="Translate from" className="min-w-0 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {list.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Swap languages"
        disabled={source === "auto"}
        onClick={() => {
          if (source === "auto") return
          setFrom(target)
          setTo(source)
          setLive(`Swapped: ${labelOf(target)} to ${labelOf(source)}`)
        }}
      >
        <ArrowLeftRight data-icon="inline-start" />
      </Button>
      <Select value={target} onValueChange={setTo}>
        <SelectTrigger aria-label="Translate to" className="min-w-0 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {list
              .filter((option) => option.code !== "auto")
              .map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </div>
  )
}
