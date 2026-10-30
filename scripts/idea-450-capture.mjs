import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { webkit } from "@playwright/test"

const phase = process.argv[2] === "after" ? "after" : "before"
const base = process.env.IDEA450_BASE ?? "http://localhost:3000"
const root = new URL("..", import.meta.url).pathname
const dir = join(root, "evidence", "IDEA-450", phase)
mkdirSync(dir, { recursive: true })

const shots = [
  { id: "card", file: "card" },
  { id: "badge", file: "badge" },
  { id: "avatars", file: "avatars" },
  { id: "dock", file: "dock" },
]

const browser = await webkit.launch()
const renders = []

async function shoot(theme) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: "es-MX",
    colorScheme: theme,
    deviceScaleFactor: 2,
  })
  if (theme === "dark") {
    await context.addInitScript(() => {
      localStorage.setItem("theme", "dark")
    })
  }
  const page = await context.newPage()
  await page.goto(`${base}/review/idea-450`, { waitUntil: "networkidle" })
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  })
  await page.evaluate(() => document.fonts.ready)

  if (theme === "light") {
    const radii = await page.locator("[data-radius]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        step: node.getAttribute("data-radius"),
        px: getComputedStyle(node).borderTopLeftRadius,
      })),
    )
    writeFileSync(join(dir, "radius.json"), `${JSON.stringify(radii, null, 2)}\n`)
  }

  for (const shot of shots) {
    const target = page.locator(`[data-shot="${shot.id}"]`)
    if ((await target.count()) === 0) continue
    await target.scrollIntoViewIfNeeded()
    const file = `${shot.file}-${theme}-390.png`
    const path = join(dir, file)
    await target.screenshot({ path })
    renders.push(file)
  }

  await page.evaluate(() => {
    const bar = document.querySelector("[data-shot=underlay]")
    if (!bar) return
    const top = bar.getBoundingClientRect().top + window.scrollY - 10
    window.scrollTo(0, Math.max(0, top))
  })
  await page.waitForTimeout(250)
  const headerFile = `site-header-${theme}-390.png`
  await page.screenshot({ path: join(dir, headerFile), fullPage: false })
  renders.push(headerFile)

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole("button", { name: "Abrir aviso" }).click()
  await page.getByRole("dialog").waitFor()
  await page.waitForTimeout(250)
  const dialogFile = `dialog-${theme}-390.png`
  await page.screenshot({ path: join(dir, dialogFile), fullPage: false })
  renders.push(dialogFile)

  const circle = page.locator("[data-shot='circle']")
  if ((await circle.count()) > 0) {
    await page.keyboard.press("Escape")
    await circle.scrollIntoViewIfNeeded()
    const file = `circle-${theme}-390.png`
    await page.screenshot({ path: join(dir, file), fullPage: false })
    renders.push(file)
  }
  const circleAbove = page.locator("[data-shot='circle-above']")
  if ((await circleAbove.count()) > 0) {
    await circleAbove.scrollIntoViewIfNeeded()
    const file = `circle-above-${theme}-390.png`
    await page.screenshot({ path: join(dir, file), fullPage: false })
    renders.push(file)
  }

  await context.close()
}

await shoot("light")
await shoot("dark")
await browser.close()

const manifest = renders.map((file) => {
  const bytes = readFileSync(join(dir, file))
  return {
    file: `evidence/IDEA-450/${phase}/${file}`,
    viewport: { width: 390, height: 844 },
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }
})
writeFileSync(join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`wrote ${renders.length} shots to ${dir}`)
