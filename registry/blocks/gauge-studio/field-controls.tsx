"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useRef, useState, type ReactNode } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatLabel, isHexColor, type SelectOption } from "@/registry/retana/ui/gauge-kit"

export const Row = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="flex h-8 items-center justify-between gap-2 rounded-md bg-input/50 px-2.5">
    <span className="truncate text-[13px] font-medium text-foreground/80">{label}</span>
    {children}
  </div>
)

export const ToggleControl = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => (
  <Row label={label}>
    <Switch size="sm" checked={checked} onCheckedChange={onChange} aria-label={label} />
  </Row>
)

const Swatch = ({ css }: { css: string }) => (
  <span
    aria-hidden
    className="size-2.5 shrink-0 rounded-full ring-1 ring-foreground/20 ring-inset"
    style={{ background: css }}
  />
)

type NormalOption = { value: string; label: string; swatch?: string }

const normalizeOption = (option: SelectOption): NormalOption =>
  typeof option === "string" ? { value: option, label: formatLabel(option) } : option

export const SelectControl = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}) => {
  const items = options.map(normalizeOption)
  return (
    <Row label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger size="sm" aria-label={label} className="h-7 w-auto max-w-[9rem] border-transparent bg-transparent px-2 shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="w-auto min-w-36">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-1.5">
                {item.swatch ? <Swatch css={item.swatch} /> : null}
                <span className="truncate">{item.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  )
}

export const TextControl = ({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <Row label={label}>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className="h-full min-w-0 flex-1 bg-transparent text-right text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/60 focus:text-foreground"
    />
  </Row>
)

const cssToHex = (color: string) => {
  if (typeof document === "undefined") return ""
  const probe = document.createElement("span")
  probe.style.color = color
  document.body.appendChild(probe)
  const got = getComputedStyle(probe).color
  probe.remove()
  const parts = got.match(/\d+(?:\.\d+)?/g)
  if (!parts || parts.length < 3) return ""
  return `#${parts
    .slice(0, 3)
    .map((part) => Math.max(0, Math.min(255, Math.round(Number(part)))).toString(16).padStart(2, "0"))
    .join("")}`
}

/** A free colour. The swatch opens the browser picker; the field keeps any CSS colour. */
export const ColorControl = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) => {
  const [draft, setDraft] = useState<string | null>(null)
  const picker = useRef<HTMLInputElement>(null)
  const armPicker = () => {
    const hex = isHexColor(value) ? value : cssToHex(value || "var(--foreground)")
    if (picker.current && hex) picker.current.value = hex
  }

  return (
    <Row label={label}>
      <div className="flex items-center gap-1.5">
        <label
          className="relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-full bg-foreground ring-1 ring-foreground/20 ring-inset"
          style={{ background: value }}
          onPointerDown={armPicker}
        >
          <input
            ref={picker}
            type="color"
            onChange={(event) => {
              setDraft(null)
              onChange(event.target.value)
            }}
            aria-label={`${label} picker`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        <input
          type="text"
          value={draft ?? value}
          spellCheck={false}
          aria-label={label}
          onChange={(event) => {
            const text = event.target.value
            setDraft(text)
            if (isHexColor(text) || text.startsWith("var(")) onChange(text)
          }}
          onBlur={() => setDraft(null)}
          className="w-[11ch] bg-transparent text-right font-mono text-xs text-muted-foreground outline-none focus:text-foreground"
        />
      </div>
    </Row>
  )
}
