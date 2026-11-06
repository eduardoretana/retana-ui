/**
 * Viewport shots of the dispatch board PLP states.
 *   pnpm dev --port 3000
 *   node scripts/capture-dispatch.mjs --base http://localhost:3000 --out /tmp/dispatch-shots
 */
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"

const args = new Map()
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index]
  if (!token?.startsWith("--")) continue
  args.set(token.slice(2), process.argv[index + 1] && !process.argv[index + 1].startsWith("--") ? process.argv[++index] : "true")
}

const base = args.get("base") ?? "http://localhost:3000"
const out = args.get("out") ?? "tmp/dispatch-shots"
const views = [
  { name: "1280", width: 1280, height: 800 },
  { name: "390", width: 390, height: 844 },
]
const themes = ["light", "dark"]
const targets = [
  { id: "filled", path: "/examples/dispatch-board?scene=filled", ready: "Inés Soler" },
  { id: "empty", path: "/examples/dispatch-board?scene=empty", ready: "No hay personas en este tablero" },
  { id: "loading", path: "/examples/dispatch-board?scene=loading", ready: "Leyendo el tablero" },
  { id: "error", path: "/examples/dispatch-board?scene=error", ready: "No se pudo cargar el tablero" },
]

await mkdir(out, { recursive: true })
const browser = await chromium.launch()

try {
  for (const theme of themes) {
    const context = await browser.newContext({ colorScheme: theme === "dark" ? "dark" : "light" })
    await context.addInitScript((mode) => {
      try {
        localStorage.setItem("theme", mode)
      } catch {
        /* private mode */
      }
      const original = window.setTimeout
      window.setTimeout = (fn, ms, ...rest) => original(fn, ms === 900 ? 120000 : ms, ...rest)
    }, theme)
    const page = await context.newPage()
    for (const target of targets) {
      for (const view of views) {
        await page.setViewportSize({ width: view.width, height: view.height })
        await page.goto(`${base}${target.path}`, { waitUntil: "domcontentloaded" })
        await page.addStyleTag({ content: "nextjs-portal{display:none !important}" }).catch(() => {})
        await page.evaluate((mode) => {
          document.documentElement.classList.toggle("dark", mode === "dark")
          document.documentElement.style.colorScheme = mode
        }, theme)
        await page.getByText(target.ready, { exact: false }).first().waitFor({ timeout: 30000 })
        const sheetClose = page.locator("[data-slot=sheet-close]")
        await sheetClose.first().waitFor({ state: "visible", timeout: 2500 }).catch(() => {})
        if (await sheetClose.count()) {
          await sheetClose.first().click()
          await page.locator("[data-slot=sheet-content]").waitFor({ state: "hidden", timeout: 3000 }).catch(() => {})
        }
        await page.evaluate((mode) => {
          document.documentElement.classList.toggle("dark", mode === "dark")
        }, theme)
        const file = path.join(out, `dispatch-${target.id}-${theme}-${view.name}.png`)
        await page.screenshot({ path: file })
        console.log(file)
      }
    }
    await context.close()
  }
} finally {
  await browser.close()
}
