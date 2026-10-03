"use client"

import * as React from "react"

import { Pipette } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type HsvaColor = {
  h: number
  s: number
  v: number
  a: number
}

const HASH = "#"
const HUE_SPACE = "hsl"
const RGB_SPACE = "rgb"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function hsvaToRgb(color: HsvaColor) {
  const h = ((color.h % 360) + 360) % 360
  const s = clamp(color.s, 0, 1)
  const v = clamp(color.v, 0, 1)
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function channel(value: number) {
  return value.toString(16).padStart(2, "0")
}

export function hsvaToHex(color: HsvaColor) {
  const { r, g, b } = hsvaToRgb(color)
  return `${channel(r)}${channel(g)}${channel(b)}`
}

export function hsvaToCss(color: HsvaColor) {
  const { r, g, b } = hsvaToRgb(color)
  return `${RGB_SPACE}(${r} ${g} ${b} / ${clamp(color.a, 0, 1)})`
}

function hueCss(hue: number) {
  return `${HUE_SPACE}(${hue} 100% 50%)`
}

function grayCss(lightness: number) {
  return `${HUE_SPACE}(0 0% ${lightness}%)`
}

export function hexToHsva(input: string): HsvaColor | null {
  const raw = input.trim().replace(/^#/, "")
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw
  if (!/^[\da-fA-F]{6}$/.test(full)) return null
  const r = Number.parseInt(full.slice(0, 2), 16) / 255
  const g = Number.parseInt(full.slice(2, 4), 16) / 255
  const b = Number.parseInt(full.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max, a: 1 }
}

export type ColorPickerProps = {
  value?: HsvaColor
  defaultValue?: HsvaColor
  onValueChange?: (value: HsvaColor) => void
  hueLabel?: string
  alphaLabel?: string
  hexLabel?: string
  saturationLabel?: string
  /** Saved colors. Selecting one commits that value. */
  swatches?: readonly HsvaColor[]
  onSwatchSelect?: (value: HsvaColor) => void
  eyedropperLabel?: string
  className?: string
}

const DEFAULT_COLOR: HsvaColor = { h: 222, s: 0.72, v: 0.78, a: 1 }

export function ColorPicker({
  value,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  hueLabel = "Hue",
  alphaLabel = "Alpha",
  hexLabel = "Hex",
  saturationLabel = "Saturation and brightness",
  swatches,
  onSwatchSelect,
  eyedropperLabel = "Pick a color from the screen",
  className,
}: ColorPickerProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [hexDraft, setHexDraft] = React.useState<string | null>(null)
  const hexId = React.useId()
  const color = value ?? uncontrolled
  const hex = hsvaToHex(color)

  function commit(next: HsvaColor) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  function moveSurface(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const s = clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const v = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1)
    commit({ ...color, s, v })
  }

  function onSurfaceKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.02
    if (event.key === "ArrowLeft") commit({ ...color, s: clamp(color.s - step, 0, 1) })
    else if (event.key === "ArrowRight") commit({ ...color, s: clamp(color.s + step, 0, 1) })
    else if (event.key === "ArrowDown") commit({ ...color, v: clamp(color.v - step, 0, 1) })
    else if (event.key === "ArrowUp") commit({ ...color, v: clamp(color.v + step, 0, 1) })
    else return
    event.preventDefault()
  }

  const white = grayCss(100)
  const black = grayCss(0)

  return (
    <div data-slot="color-picker" className={cn("flex w-64 flex-col gap-3", className)}>
      <div
        role="slider"
        tabIndex={0}
        aria-label={saturationLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(color.s * 100)}
        aria-valuetext={`${Math.round(color.s * 100)}% saturation, ${Math.round(color.v * 100)}% brightness`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          moveSurface(event)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) moveSurface(event)
        }}
        onKeyDown={onSurfaceKey}
        className="relative h-36 cursor-crosshair rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          backgroundColor: hueCss(color.h),
          backgroundImage: `linear-gradient(to top, ${black}, transparent), linear-gradient(to right, ${white}, transparent)`,
        }}
      >
        <span
          aria-hidden
          className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-sm"
          style={{ left: `${color.s * 100}%`, top: `${(1 - color.v) * 100}%`, background: hsvaToCss({ ...color, a: 1 }) }}
        />
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {hueLabel}
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(color.h)}
          aria-label={hueLabel}
          onChange={(event) => commit({ ...color, h: Number(event.target.value) })}
          className="h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${hueCss(0)}, ${hueCss(60)}, ${hueCss(120)}, ${hueCss(180)}, ${hueCss(240)}, ${hueCss(300)}, ${hueCss(360)})`,
          }}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        {alphaLabel}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(color.a * 100)}
          aria-label={alphaLabel}
          onChange={(event) => commit({ ...color, a: Number(event.target.value) / 100 })}
          className="h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{
            backgroundColor: grayCss(80),
            backgroundImage: `linear-gradient(to right, ${hsvaToCss({ ...color, a: 0 })}, ${hsvaToCss({ ...color, a: 1 })})`,
          }}
        />
      </label>
      <div className="flex items-end gap-2">
        <span
          aria-hidden
          className="size-9 shrink-0 rounded-md border border-border"
          style={{ background: hsvaToCss(color) }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label htmlFor={hexId} className="text-xs text-muted-foreground">
            {hexLabel}
          </Label>
          <Input
            id={hexId}
            value={hexDraft ?? `${HASH}${hex}`}
            spellCheck={false}
            autoCapitalize="off"
            onFocus={() => setHexDraft(`${HASH}${hex}`)}
            onChange={(event) => setHexDraft(event.target.value)}
            onBlur={() => {
              const next = hexDraft ? hexToHsva(hexDraft) : null
              if (next) commit({ ...next, a: color.a })
              setHexDraft(null)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const next = hexDraft ? hexToHsva(hexDraft) : null
                if (next) commit({ ...next, a: color.a })
                setHexDraft(null)
              }
            }}
            className="font-mono uppercase"
          />
        </div>
        {"EyeDropper" in globalThis ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={eyedropperLabel}
            onClick={() => {
              const Dropper = (globalThis as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
              if (!Dropper) return
              void new Dropper()
                .open()
                .then((result) => {
                  const next = hexToHsva(result.sRGBHex)
                  if (next) commit({ ...next, a: color.a })
                })
                .catch(() => {})
            }}
          >
            <Pipette />
          </Button>
        ) : null}
      </div>
      {swatches?.length ? (
        <div className="flex flex-wrap gap-1.5" role="listbox" aria-label={hexLabel}>
          {swatches.map((swatch, index) => (
            <button
              key={`${swatch.h}-${swatch.s}-${swatch.v}-${index}`}
              type="button"
              role="option"
              aria-selected={swatch.h === color.h && swatch.s === color.s && swatch.v === color.v}
              aria-label={`${hexLabel} ${index + 1}`}
              className="size-6 rounded-md border border-border"
              style={{ background: hsvaToCss(swatch) }}
              onClick={() => {
                commit(swatch)
                onSwatchSelect?.(swatch)
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
