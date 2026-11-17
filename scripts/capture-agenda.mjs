/**
 * Viewport screenshots of the agenda demo. Captures the page, not the desktop.
 *
 *   pnpm exec playwright install chromium
 *   pnpm dev --port 3000
 *   node scripts/capture-agenda.mjs --base http://localhost:3000 --set after --out /tmp/agenda-shots
 *
 * `--set before` shoots /examples/agenda (the week, no resource axis).
 * `--set after` shoots Choques, Sobrecapacidad and Muchos recursos.
 * Each shot is 1280×800 and 390×844, light and dark.
 * Contrast of the conflict notice and the over-capacity chip must be at least 4.5:1.
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"

const args = new Map()
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index]
  if (!token?.startsWith("--")) continue
  args.set(token.slice(2), process.argv[index + 1] && !process.argv[index + 1].startsWith("--") ? process.argv[++index] : "true")
}

const base = args.get("base") ?? "http://localhost:3000"
const set = args.get("set") ?? "after"
const out = args.get("out") ?? "tmp/agenda-shots"

const views = [
  { name: "1280", width: 1280, height: 800 },
  { name: "390", width: 390, height: 844 },
]
const themes = ["light", "dark"]

const targets =
  set === "before"
    ? [{ id: "before", path: "/examples/agenda", ready: "Semana" }]
    : [
        { id: "after-conflicts", path: "/examples/agenda?scene=conflicts", ready: "Choque" },
        { id: "after-over", path: "/examples/agenda?scene=over", ready: "de más" },
        { id: "after-many", path: "/examples/agenda?scene=many", ready: "Muchos recursos" },
      ]

function parseColor(value) {
  const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/.exec(value)
  if (!match) return null
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] == null ? 1 : Number(match[4]) }
}

function channel(value) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance({ r, g, b }) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(foreground, background) {
  const a = luminance(foreground)
  const b = luminance(background)
  const light = Math.max(a, b)
  const dark = Math.min(a, b)
  return (light + 0.05) / (dark + 0.05)
}

async function readPair(page, selector) {
  return page.evaluate((slot) => {
    const paint = (value) => {
      const canvas = document.createElement("canvas")
      canvas.width = 1
      canvas.height = 1
      const context = canvas.getContext("2d")
      if (!context) return null
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)
      const [r, g, b] = context.getImageData(0, 0, 1, 1).data
      return `rgb(${r}, ${g}, ${b})`
    }
    const node = document.querySelector(slot)
    if (!node) return null
    const color = paint(getComputedStyle(node).color)
    let current = node
    let background = "rgb(255, 255, 255)"
    while (current) {
      const next = getComputedStyle(current).backgroundColor
      if (next && next !== "transparent" && !next.endsWith(", 0)") && next !== "rgba(0, 0, 0, 0)") {
        background = paint(next)
        break
      }
      current = current.parentElement
    }
    return { color, background }
  }, selector)
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
const report = []

try {
  for (const theme of themes) {
    const context = await browser.newContext({ colorScheme: theme === "dark" ? "dark" : "light" })
    await context.addInitScript((mode) => {
      try {
        localStorage.setItem("theme", mode)
      } catch {
        /* private mode */
      }
    }, theme)
    const page = await context.newPage()
    for (const target of targets) {
      for (const view of views) {
        await page.setViewportSize({ width: view.width, height: view.height })
        await page.goto(`${base}${target.path}`, { waitUntil: "domcontentloaded" })
        await page.addStyleTag({ content: "nextjs-portal{display:none !important}" }).catch(() => {})
        await page.evaluate((mode) => {
          document.documentElement.classList.toggle("dark", mode === "dark")
          try {
            localStorage.setItem("theme", mode)
          } catch {
            /* ignore */
          }
        }, theme)
        await page.getByText(target.ready, { exact: false }).first().waitFor({ timeout: 20000 })
        if (set === "after") {
          const layout = view.width < 560 ? "list" : "columns"
          await page.locator(`[data-resource-layout=${layout}]`).waitFor({ timeout: 20000 })
        }
        await page.evaluate((mode) => {
          document.documentElement.classList.toggle("dark", mode === "dark")
        }, theme)
        if (set === "after" && view.width >= 1000) {
          const overlap = await page.evaluate(() => {
            const sidebar = document.querySelector("[data-slot=agenda-sidebar]")
            const grid = document.querySelector("[role=grid]")
            if (!sidebar || !grid) return { ok: true, skipped: true }
            const side = sidebar.getBoundingClientRect()
            const port = grid.getBoundingClientRect()
            const crosses = (a, b) => a.right > b.left + 1 && a.left < b.right - 1 && a.bottom > b.top + 1 && a.top < b.bottom - 1
            const clip = (rect) => {
              const left = Math.max(rect.left, port.left)
              const right = Math.min(rect.right, port.right)
              const top = Math.max(rect.top, port.top)
              const bottom = Math.min(rect.bottom, port.bottom)
              if (right - left <= 1 || bottom - top <= 1) return null
              return { left, right, top, bottom }
            }
            const headers = [...grid.querySelectorAll("[role=columnheader]")]
            const hit = headers.find((node) => {
              const visible = clip(node.getBoundingClientRect())
              return visible ? crosses(visible, side) : false
            })
            return {
              ok: port.right <= side.left + 1 && !hit,
              portRight: port.right,
              sideLeft: side.left,
              hit: hit ? hit.getAttribute("aria-label") ?? hit.textContent : null,
            }
          })
          if (!overlap.ok) {
            throw new Error(`resource column overlaps the sidebar: ${JSON.stringify(overlap)}`)
          }
          console.log(`layout: grid ends at ${overlap.portRight}, sidebar starts at ${overlap.sideLeft}`)
        }
        const file = path.join(out, `agenda-${target.id}-${theme}-${view.name}.png`)
        await page.screenshot({ path: file })
        const row = { file, theme, viewport: view.name, scene: target.id, contrast: {} }
        for (const slot of ["[data-slot=agenda-conflict]", "[data-slot=agenda-capacity-over]"]) {
          const pair = await readPair(page, slot)
          if (!pair) {
            row.contrast[slot] = null
            continue
          }
          const fg = parseColor(pair.color)
          const bg = parseColor(pair.background)
          const ratio = fg && bg ? contrast(fg, bg) : null
          row.contrast[slot] = { ...pair, ratio }
          if (ratio != null && ratio < 4.5) {
            throw new Error(`${file} ${slot} contrast ${ratio.toFixed(2)} is below 4.5`)
          }
        }
        report.push(row)
        console.log(file)
      }
    }
    await context.close()
  }
} finally {
  await browser.close()
}

const contrastFile = path.join(out, `contrast-${set}.json`)
await writeFile(contrastFile, JSON.stringify(report, null, 2))
console.log(`contrast: ${contrastFile}`)
