import { mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { chromium } from "playwright"
import { createServer } from "vite"

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const out = process.env.CAPTURE_DIR ?? "/opt/cursor/artifacts"
mkdirSync(out, { recursive: true })

const server = await createServer({
  configFile: path.join(repo, "vue/vite.config.ts"),
  server: { host: "127.0.0.1", port: 4217 },
})
await server.listen()
const address = server.httpServer?.address()
const port = typeof address === "object" && address ? address.port : 4217
const base = `http://127.0.0.1:${port}/vue/demo/bandeja/index.html`

const shots = [
  { file: "bandeja-vue-1280-light.png", scene: "filled", theme: "light", width: 1280, height: 800 },
  { file: "bandeja-vue-1280-cenit-light.png", scene: "cenit", theme: "light", width: 1280, height: 800 },
  { file: "bandeja-vue-390-light.png", scene: "filled", theme: "light", width: 390, height: 844 },
  { file: "bandeja-vue-390-hilo-light.png", scene: "hilo", theme: "light", width: 390, height: 844 },
  { file: "bandeja-vue-1280-dark.png", scene: "filled", theme: "dark", width: 1280, height: 800 },
]

const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()
const written = []
for (const shot of shots) {
  await page.setViewportSize({ width: shot.width, height: shot.height })
  await page.goto(`${base}?scene=${shot.scene}&theme=${shot.theme}&locale=es`)
  await page.waitForSelector("[data-slot=inbox-crm]")
  const file = path.join(out, shot.file)
  await page.screenshot({ path: file })
  written.push(file)
}
await browser.close()
await server.close()
console.log(written.join("\n"))
