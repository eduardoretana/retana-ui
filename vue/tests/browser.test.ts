import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const repo = path.resolve(import.meta.dirname, "../..")
const preview = path.join(repo, "vue/preview/index.html")

const pieces: Record<string, string[]> = {
  "time-off-stats": ["filled", "empty", "loading", "error", "zero", "pending"],
  "decision-inbox": ["filled", "empty", "loading", "error", "answered", "folded"],
  lightbox: ["filled", "empty", "loading", "error"],
}

describe("navegador del piloto", () => {
  it("axe, foco, 390, reduced-motion y Vuetify", async () => {
    expect(existsSync(preview), "AC8-PREVIEW").toBe(true)
    const { createServer } = await import("vite")
    const { chromium } = await import("playwright")
    const AxeBuilder = (await import("@axe-core/playwright")).default
    const server = await createServer({
      configFile: path.join(repo, "vue/vite.config.ts"),
      server: { host: "127.0.0.1", port: 4179, strictPort: false },
    })
    await server.listen()
    const address = server.httpServer?.address()
    const port = typeof address === "object" && address ? address.port : 4179
    const base = `http://127.0.0.1:${port}`
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    const serious = async (label: string) => {
      const result = await new AxeBuilder({ page }).analyze()
      const bad = result.violations.filter((item) => item.impact === "serious" || item.impact === "critical")
      expect(bad.map((item) => item.id), label).toEqual([])
    }
    try {
      for (const framework of ["vue", "react"] as const) {
        for (const theme of ["light", "dark"] as const) {
          for (const [piece, scenes] of Object.entries(pieces)) {
            for (const scene of scenes) {
              await page.setViewportSize({ width: 390, height: 844 })
              await page.goto(`${base}/vue/preview/index.html?framework=${framework}&piece=${piece}&scene=${scene}&theme=${theme}&locale=es`)
              await page.waitForSelector("[data-retana-scene]")
              expect(await page.evaluate(() => document.documentElement.lang)).toBe("es-MX")
              await serious(`AC8-${framework}-${theme}-${piece}-${scene}-es`)
            }
          }
          for (const piece of Object.keys(pieces)) {
            await page.goto(`${base}/vue/preview/index.html?framework=${framework}&piece=${piece}&scene=filled&theme=${theme}&locale=en`)
            await page.waitForSelector("[data-retana-scene]")
            expect(await page.evaluate(() => document.documentElement.lang)).toBe("en")
            await serious(`AC8-${framework}-${theme}-${piece}-filled-en`)
          }
        }
      }

      await page.setViewportSize({ width: 390, height: 844 })
      for (const framework of ["vue", "react"] as const) {
        for (const piece of Object.keys(pieces)) {
          await page.goto(`${base}/vue/preview/index.html?framework=${framework}&piece=${piece}&scene=filled&theme=light&locale=es`)
          await page.waitForSelector("[data-retana-scene]")
          const extra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
          expect(extra, `AC8-OVERFLOW-${framework}-${piece}`).toBeLessThanOrEqual(1)
        }
      }

      await page.goto(`${base}/vue/preview/index.html?framework=vue&piece=lightbox&scene=filled&theme=light&locale=es`)
      await page.waitForSelector("[data-retana-scene]")
      const opener = page.getByRole("button", { name: "Estudio" })
      await opener.click()
      const dialog = page.getByRole("dialog")
      await dialog.waitFor({ state: "visible" })
      expect(await page.evaluate(() => document.querySelector("[role=dialog]")?.contains(document.activeElement))).toBe(true)
      for (let step = 0; step < 8; step++) await page.keyboard.press("Tab")
      expect(await page.evaluate(() => document.querySelector("[role=dialog]")?.contains(document.activeElement)), "AC4-TRAP").toBe(true)
      await page.keyboard.press("Escape")
      await dialog.waitFor({ state: "hidden" })
      const returned = await page.evaluate(() => {
        const el = document.activeElement
        return el?.querySelector("img")?.getAttribute("alt") || el?.getAttribute("aria-label") || ""
      })
      expect(returned, "AC4-RETURN").toBe("Estudio")

      await page.emulateMedia({ reducedMotion: "reduce" })
      await page.goto(`${base}/vue/preview/index.html?framework=vue&piece=time-off-stats&scene=loading&theme=light&locale=es`)
      await page.waitForSelector("[data-slot=skeleton]")
      const animation = await page.locator("[data-slot=skeleton]").first().evaluate((el) => getComputedStyle(el).animationName)
      expect(animation, "AC8-REDUCED").toBe("none")

      await page.goto(`${base}/tokens/fixture-primary.html`)
      const button = page.getByRole("button", { name: "Primario" })
      await page.evaluate(() => document.documentElement.style.setProperty("--primary", "rgb(1, 2, 3)"))
      const first = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
      await page.evaluate(() => document.documentElement.style.setProperty("--primary", "rgb(4, 5, 6)"))
      const second = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(first, "AC3-PRIMARY").not.toBe(second)

      await page.goto(`${base}/vue/preview/index.html?framework=vue&piece=decision-inbox&scene=filled&theme=light&locale=es`)
      await page.getByRole("button", { name: /Hoy, antes de las 18:00 para/ }).click()
      const live = await page.locator("[aria-live=polite]").innerText()
      expect(live).toContain("Respuesta: Hoy, antes de las 18:00")

      await page.goto(`${base}/hosts/razor/time-off-stats.html`)
      await serious("AC6-AXE-RAZOR")
      expect(await page.locator("script").count(), "AC6-NO-JS").toBe(0)

      await page.goto(`${base}/vue/demo/index.html`)
      await page.waitForSelector(".v-application")
      await page.getByRole("heading", { name: "Saldo" }).waitFor()
      await page.getByRole("heading", { name: "Llamadas abiertas" }).waitFor()
      const opacity = await page.evaluate(() => getComputedStyle(document.querySelector(".v-application") ?? document.documentElement).getPropertyValue("--v-medium-emphasis-opacity").trim())
      expect(opacity, "AC-VUETIFY-OPACITY").toBe("0.7")
      await serious("AC8-VUETIFY-DEMO")
    } finally {
      await browser.close()
      await server.close()
    }
  })
})
