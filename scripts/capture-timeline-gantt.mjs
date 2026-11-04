/**
 * Viewport screenshots of the timeline gantt example.
 * Chrome is launched through playwright-core. Nothing outside the viewport is captured.
 *
 *   node scripts/capture-timeline-gantt.mjs --phase before --out /opt/cursor/artifacts/timeline-gantt
 *   node scripts/capture-timeline-gantt.mjs --phase after --out /opt/cursor/artifacts/timeline-gantt
 *
 * before: the CPL demo, without progress.
 * after: scenes with progress, a group row at 100%, and the edit sheet open.
 */

import { mkdir } from "node:fs/promises"
import path from "node:path"

import { chromium } from "playwright-core"

const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome"
const BASE = process.env.GANTT_BASE_URL || "http://127.0.0.1:3000"

const widths = [1280, 390]
const themes = ["light", "dark"]

const beforeShots = [{ id: "demo", path: "/examples/timeline-gantt", wait: "[data-slot=timeline-gantt-bar]" }]

const afterShots = [
  { id: "progress", path: "/examples/timeline-gantt?scene=progress", wait: "[data-slot=timeline-gantt-progress]", pressed: "Con avance" },
  { id: "group", path: "/examples/timeline-gantt?scene=complete", wait: "[data-slot=timeline-gantt-group-progress]", pressed: "Grupo al 100%" },
  { id: "editor", path: "/examples/timeline-gantt?scene=editor", wait: "[data-slot=sheet-content]", pressed: "Edición" },
]

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  if (index === -1) return fallback
  return process.argv[index + 1] ?? fallback
}

const phase = arg("phase", "after")
const outDir = path.resolve(arg("out", "artifacts/timeline-gantt"))
const shots = phase === "before" ? beforeShots : afterShots

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
})

await mkdir(outDir, { recursive: true })

const saved = []
for (const width of widths) {
  const height = width === 390 ? 844 : 800
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      colorScheme: theme,
    })
    await context.addInitScript((mode) => {
      try {
        localStorage.setItem("theme", mode)
      } catch {
        /* private mode */
      }
    }, theme)
    const page = await context.newPage()
    for (const shot of shots) {
      const url = new URL(shot.path, BASE)
      url.searchParams.set("capture", phase)
      await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 120_000 })
      if (theme === "dark") {
        await page.evaluate(() => document.documentElement.classList.add("dark"))
      } else {
        await page.evaluate(() => document.documentElement.classList.remove("dark"))
      }
      await page.waitForSelector(shot.wait, { timeout: 60_000 })
      if (shot.pressed) {
        await page.waitForFunction((label) => {
          return [...document.querySelectorAll('button[aria-pressed="true"]')].some((button) => button.textContent?.includes(label))
        }, shot.pressed)
      }
      await page.evaluate(() => document.fonts?.ready)
      await page.waitForTimeout(400)
      // Motion's entrance can stay at opacity 0 or scaleX(0) in headless Chrome. Settle the resting state.
      await page.evaluate(() => {
        const root = document.querySelector("[data-slot=timeline-gantt]")
        if (!root) return
        for (const el of root.querySelectorAll("[style*='opacity']")) {
          if (getComputedStyle(el).opacity === "0") el.style.opacity = "1"
        }
        for (const fill of root.querySelectorAll("[data-slot=timeline-gantt-progress-fill]")) {
          const ratio = Number(fill.getAttribute("data-ratio"))
          if (!Number.isFinite(ratio)) continue
          const transform = getComputedStyle(fill).transform
          const match = /matrix\(\s*(-?[\d.]+)/.exec(transform)
          const scale = match ? Number(match[1]) : transform === "none" ? 1 : 0
          if (scale < ratio - 0.04) fill.style.transform = `scaleX(${ratio})`
        }
      })
      const file = path.join(outDir, `${phase}-${shot.id}-${theme}-${width}.png`)
      await page.screenshot({ path: file, fullPage: false, caret: "hide" })
      saved.push(file)
      console.log(file)
    }
    await context.close()
  }
}

await browser.close()
console.log(`saved ${saved.length} viewport shots`)
