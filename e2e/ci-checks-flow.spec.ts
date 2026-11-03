import { mkdir } from "node:fs/promises"
import path from "node:path"

import { expect, test, type Page } from "@playwright/test"

const outDir = "/opt/cursor/artifacts/ci-checks"

const shots: { name: string; path: string }[] = [
  { name: "antes-cpl-docs", path: "/docs" },
  { name: "pr-create-card", path: "/examples/pr-create-card?scene=filled" },
  { name: "checks-panel", path: "/examples/checks-panel?scene=open" },
  { name: "agent-fix-timeline", path: "/examples/agent-fix-timeline?scene=filled" },
  { name: "merge-button", path: "/examples/merge-button?scene=filled" },
  { name: "ci-checks-story-error", path: "/examples/ci-checks-story?scene=error" },
  { name: "ci-checks-story-merged", path: "/examples/ci-checks-story?scene=merged" },
  { name: "ci-checks-live", path: "/examples/ci-checks-live?scene=filled" },
]

async function paint(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => {
    localStorage.setItem("theme", value)
  }, theme)
}

test("walks create, fail, fix, and merge from the keyboard", async ({ page }) => {
  await paint(page, "light")
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto("/examples/ci-checks-story?scene=flow")
  const next = page.getByRole("button", { name: "Siguiente paso" })
  await expect(next).toBeVisible()
  await expect(page.getByRole("button", { name: /Comprobaciones/ })).toHaveCount(0)
  for (let step = 0; step < 8; step += 1) {
    if (await page.getByText("Fusionado en main").count()) break
    await next.click()
  }
  await expect(page.getByText("Fusionado en main")).toBeVisible()
  await expect(page.getByText("El recibo pierde el folio cuando el horno recarga")).toBeVisible()
  await mkdir(outDir, { recursive: true })
  await page.screenshot({ path: path.join(outDir, "scenario-flow-1280-light.png"), fullPage: true })
})

for (const shot of shots) {
  for (const theme of ["light", "dark"] as const) {
    for (const viewport of [
      { name: "1280", width: 1280, height: 900 },
      { name: "390", width: 390, height: 844 },
    ]) {
      test(`capture ${shot.name} ${viewport.name} ${theme}`, async ({ page }) => {
        await paint(page, theme)
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(shot.path)
        await expect(page.getByRole("heading").first()).toBeVisible()
        await mkdir(outDir, { recursive: true })
        await page.screenshot({
          path: path.join(outDir, `${shot.name}-${viewport.name}-${theme}.png`),
          fullPage: true,
        })
      })
    }
  }
}
