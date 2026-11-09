import { mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"
import { createServer } from "vite"

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const out = process.env.CAPTURE_DIR ?? "/opt/cursor/artifacts/piloto-vue"
mkdirSync(out, { recursive: true })

const pieces = {
  "time-off-stats": ["filled", "empty", "loading", "error", "zero", "pending"],
  "decision-inbox": ["filled", "empty", "loading", "error", "answered", "folded"],
  lightbox: ["filled", "empty", "loading", "error"],
}

const server = await createServer({
  configFile: path.join(repo, "vue/vite.config.ts"),
  server: { host: "127.0.0.1", port: 4201 },
})
await server.listen()
const address = server.httpServer?.address()
const port = typeof address === "object" && address ? address.port : 4201
const base = `http://127.0.0.1:${port}`
const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()

const shots = []
for (const framework of ["react", "vue"]) {
  for (const [piece, scenes] of Object.entries(pieces)) {
    for (const scene of scenes) {
      await page.setViewportSize({ width: 440, height: 900 })
      await page.goto(`${base}/vue/preview/index.html?framework=${framework}&piece=${piece}&scene=${scene}&theme=light&locale=es`)
      await page.waitForSelector("[data-retana-scene]")
      const file = path.join(out, `${framework}-${piece}-${scene}-light-440.png`)
      await page.screenshot({ path: file })
      shots.push(file)
    }
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto(`${base}/vue/preview/index.html?framework=${framework}&piece=${piece}&scene=filled&theme=dark&locale=es`)
    await page.waitForSelector("[data-retana-scene]")
    const dark = path.join(out, `${framework}-${piece}-filled-dark-440.png`)
    await page.screenshot({ path: dark })
    shots.push(dark)
    await page.emulateMedia({ colorScheme: "light" })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/vue/preview/index.html?framework=${framework}&piece=${piece}&scene=filled&theme=light&locale=es`)
    await page.waitForSelector("[data-retana-scene]")
    const narrow = path.join(out, `${framework}-${piece}-filled-light-390.png`)
    await page.screenshot({ path: narrow })
    shots.push(narrow)
  }
}

await browser.close()
await server.close()
console.log(shots.join("\n"))
