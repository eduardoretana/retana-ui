import { expect, test } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const out = process.env.COLLECTION_VIEWS_OUT ?? "ui/evidence/retana-ui-collection-views/renders"

const views = [
  { id: "board", scene: "filled", ready: "Jarrón cobalto" },
  { id: "list", scene: "list", ready: "Pedido de la casa León" },
  { id: "timeline", scene: "timeline", ready: "Jarrón cobalto" },
] as const

const viewports = [
  { name: "390", width: 390, height: 844 },
  { name: "1280", width: 1280, height: 800 },
] as const

test.beforeAll(async () => {
  await mkdir(out, { recursive: true })
})

for (const viewport of viewports) {
  for (const view of views) {
    test(`${view.id} at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`/examples/collection-views?scene=${view.scene}`)
      await expect(page.getByRole("heading", { name: "Pedidos del taller" })).toBeVisible()
      await expect(page.getByText(view.ready).first()).toBeVisible()
      if (view.id === "timeline") {
        await page.locator("[data-slot='collection-bar']").first().waitFor()
        await page.waitForFunction(() => {
          const bar = document.querySelector("[data-slot='collection-bar']")
          if (!(bar instanceof HTMLElement)) return false
          const opacity = Number(getComputedStyle(bar).opacity)
          return opacity > 0.9 && bar.getBoundingClientRect().width > 8
        })
        await page.waitForTimeout(800)
      } else {
        await page.waitForTimeout(400)
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(1)
      await page.screenshot({ path: `${out}/${view.id}-${viewport.name}.png` })
    })
  }
}

test("reduced motion cuts the morph", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/examples/collection-views?scene=filled")
  await expect(page.locator("[data-slot='collection-views']")).toHaveAttribute("data-motion", "crossfade")
  await expect(page.locator("[data-shared]")).toHaveCount(0)
})
