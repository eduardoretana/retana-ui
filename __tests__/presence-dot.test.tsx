import { readFileSync } from "node:fs"
import path from "node:path"

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ChatThread } from "@/registry/ui/chat-thread"
import { ConversationItem } from "@/registry/ui/conversation-item"
import { PartyPanel } from "@/registry/ui/party-panel"

function oklchToRgb(L: number, C: number, H: number) {
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return linear.map((channel) => {
    const clamped = Math.min(1, Math.max(0, channel))
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
  })
}

function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(left: number[], right: number[]) {
  const [hi, lo] = luminance(left) > luminance(right) ? [luminance(left), luminance(right)] : [luminance(right), luminance(left)]
  return (hi + 0.05) / (lo + 0.05)
}

function parseOklch(value: string) {
  const match = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (!match) throw new Error(`No oklch in ${value}`)
  return oklchToRgb(Number(match[1]), Number(match[2]), Number(match[3]))
}

function themeBlock(css: string, selector: string) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = source.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`))
  return match?.[1] ?? ""
}

function token(block: string, name: string) {
  return block.match(new RegExp(`${name}:\\s*(oklch\\([^)]+\\))`))?.[1]
}

describe("presence dot", () => {
  it("uses the success token and keeps 3:1 against the background", () => {
    render(
      <div>
        <ConversationItem item={{ id: "a", title: "Taller Ámbar", presence: "online" }} />
        <ConversationItem item={{ id: "b", title: "Renata Vidal", kind: "contact", role: "Diseñadora", presence: "online" }} />
        <ChatThread label="Hilo" title="Taller Ámbar" presence="online" />
        <PartyPanel name="Casa Lerma" presence="online" />
      </div>,
    )

    const dots = [...document.querySelectorAll("[data-presence=online]")]
    expect(dots.length).toBeGreaterThan(0)
    for (const dot of dots) {
      expect(dot.className).not.toMatch(/\bbg-primary\b/)
      expect(dot.getAttribute("style") ?? "").toContain("var(--success, var(--chart-2))")
    }
    expect(dots).toHaveLength(4)

    const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8")
    for (const selector of [":root", ".dark"]) {
      const block = themeBlock(css, selector)
      const background = token(block, "--background")
      const dot = token(block, "--success") ?? token(block, "--chart-2")
      expect(background, selector).toBeTruthy()
      expect(dot, selector).toBeTruthy()
      expect(contrast(parseOklch(background!), parseOklch(dot!))).toBeGreaterThanOrEqual(3)
    }
  })
})
