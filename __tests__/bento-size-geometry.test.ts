import { existsSync } from "node:fs"
import { spawn, type ChildProcess } from "node:child_process"
import { afterAll, describe, expect, it } from "vitest"

const chrome = ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(
  (path) => existsSync(path),
)

type Box = { size: string | null; cell: number; card: number; width: number }

async function probe(url: string, width: number, height: number): Promise<{ rows: string; boxes: Box[] }> {
  const { chromium } = await import("playwright-core")
  const browser = await chromium.launch({
    executablePath: chrome,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  })
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForSelector("[data-slot='bento-cell']")
  const result = await page.evaluate(() => {
    const track = document.querySelector("[data-slot='bento-grid-track']")
    const boxes = [...document.querySelectorAll("[data-slot='bento-cell']")].map((cell) => {
      const card = cell.querySelector("[data-slot='bento-feature-card']")
      const cellBox = cell.getBoundingClientRect()
      const cardBox = card?.getBoundingClientRect()
      return {
        size: cell.getAttribute("data-size"),
        cell: cellBox.height,
        card: cardBox?.height ?? 0,
        width: cellBox.width,
        cardWidth: cardBox?.width ?? 0,
      }
    })
    return { rows: track ? getComputedStyle(track).gridAutoRows : "", boxes }
  })
  await browser.close()
  return result
}

describe.skipIf(!chrome)("bento size geometry", () => {
  const port = 3217
  let child: ChildProcess | undefined
  let base = ""

  afterAll(() => {
    if (child?.pid) process.kill(-child.pid, "SIGTERM")
  })

  it(
    "cards fill their cells at 1280 and the tall cell is at least 1.9 times the sm cell",
    async () => {
      base = await ensureServer(port)
      const desktop = await probe(
        `${base}/examples/bento-feature-card?scene=presets&theme=light&locale=es-MX&motion=full`,
        1280,
        1000,
      )
      expect(desktop.rows === "256px" || desktop.rows === "16rem").toBe(true)
      const sm = desktop.boxes.find((box) => box.size === "sm")
      const tall = desktop.boxes.find((box) => box.size === "tall")
      expect(sm).toBeTruthy()
      expect(tall).toBeTruthy()
      for (const box of desktop.boxes) {
        expect(Math.abs(box.card - box.cell)).toBeLessThanOrEqual(1)
      }
      expect(tall!.cell).toBeGreaterThanOrEqual(sm!.cell * 1.9)

      const phone = await probe(
        `${base}/examples/bento-feature-card?scene=presets&theme=light&locale=es-MX&motion=full`,
        390,
        900,
      )
      expect(phone.rows).toBe("auto")
      for (const box of phone.boxes) {
        expect(Math.abs(box.card - box.cell)).toBeLessThanOrEqual(1)
      }
      expect(phone.boxes.every((box) => box.width < 400)).toBe(true)
    },
    90_000,
  )

  async function ensureServer(nextPort: number) {
    const health = `http://127.0.0.1:${nextPort}/api/health`
    if (await reachable(health)) return `http://127.0.0.1:${nextPort}`
    const running = await reachable("http://127.0.0.1:3000/api/health")
    if (running) return "http://127.0.0.1:3000"
    child = spawn("pnpm", ["exec", "next", "dev", "--hostname", "127.0.0.1", "--port", String(nextPort)], {
      cwd: process.cwd(),
      stdio: "ignore",
      detached: true,
    })
    const started = await waitFor(health)
    if (!started) throw new Error(`bento geometry server did not answer on ${health}`)
    return `http://127.0.0.1:${nextPort}`
  }
})

async function reachable(url: string) {
  try {
    const response = await fetch(url, { redirect: "manual" })
    return response.status === 200
  } catch {
    return false
  }
}

async function waitFor(url: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await reachable(url)) return true
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return false
}
