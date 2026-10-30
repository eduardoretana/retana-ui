import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator } from "@playwright/test"

async function fontSize(locator: Locator) {
  await locator.scrollIntoViewIfNeeded()
  return locator.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
}

async function expectAtLeast16(locator: Locator) {
  await expect(locator).toBeVisible()
  expect(await fontSize(locator)).toBeGreaterThanOrEqual(16)
}

async function expectVisibleFocus(locator: Locator) {
  await locator.evaluate((el) => {
    if (el instanceof HTMLElement) el.focus({ focusVisible: true } as FocusOptions)
  })
  const paint = await locator.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    }
  })
  const outlined = paint.outlineStyle !== "none" && paint.outlineWidth !== "0px"
  const shadowed = paint.boxShadow !== "none"
  expect(outlined || shadowed, JSON.stringify(paint)).toBe(true)
}

test.describe("IDEA-448 móvil 390", () => {
  test("los 11 controles nativos miden al menos 16 px", async ({ page }) => {
    await page.goto("/examples/crm")
    const bruma = page.getByRole("row", { name: /Taller Bruma/ })
    await bruma.getByRole("button", { name: "Taller Bruma", exact: true }).click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Empresa Taller Bruma" }))
    await bruma.getByRole("button", { name: "Inés Quesada", exact: true }).click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Responsable de Taller Bruma" }))
    await bruma.getByRole("button", { name: "$48,000", exact: true }).click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Valor de Taller Bruma" }))

    await page.goto("/examples/onboarding")
    await page.getByRole("button", { name: /Equipo/ }).click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Invitaciones" }))

    await page.goto("/examples/pipeline-board")
    await page.getByRole("button", { name: "Mostrar filtros" }).click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Desde" }))
    await expectAtLeast16(page.getByRole("textbox", { name: "Hasta" }))

    await page.goto("/examples/candidate-detail")
    const schedule = page.getByRole("button", { name: "Agendar" })
    await schedule.scrollIntoViewIfNeeded()
    await schedule.click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Tipo de cita" }))
    await expectAtLeast16(page.getByRole("textbox", { name: "Fecha y hora" }))

    await page.goto("/examples/json-viewer")
    await expectAtLeast16(page.getByRole("searchbox", { name: "Search JSON" }).first())

    await page.goto("/examples/parameter-slider")
    await page.getByRole("button", { name: "0.40" }).click()
    await expectAtLeast16(page.getByRole("textbox", { name: "Variation" }))

    await page.goto("/examples/view-calendar")
    await expectAtLeast16(page.locator('input[type="month"]'))
  })

  test("el viewport cubre el safe area y el foco sigue visible", async ({ page }) => {
    await page.goto("/examples/bottom-sheet")
    const content = await page.locator('meta[name="viewport"]').getAttribute("content")
    expect(content).toContain("viewport-fit=cover")
    expect(content).not.toContain("maximum-scale")
    expect(content).not.toContain("user-scalable=no")

    const sheet = page.locator("[data-slot=bottom-sheet]")
    await expect(sheet).toBeVisible()
    const safe = await sheet.evaluate((el) => {
      const probe = document.createElement("div")
      probe.style.paddingBottom = "env(safe-area-inset-bottom)"
      document.body.appendChild(probe)
      const inset = getComputedStyle(probe).paddingBottom
      probe.remove()
      return {
        inset,
        className: el.className,
        tap: getComputedStyle(document.documentElement).getPropertyValue("-webkit-tap-highlight-color"),
      }
    })
    expect(safe.className).toContain("env(safe-area-inset-bottom")
    expect(safe.tap === "transparent" || safe.tap === "rgba(0, 0, 0, 0)").toBe(true)

    await page.goto("/examples/crm")
    await page.getByRole("button", { name: "Taller Bruma", exact: true }).click()
    await expectVisibleFocus(page.getByRole("textbox", { name: "Empresa Taller Bruma" }))
  })

  test("axe no marca serious ni critical en los controles de esta IDEA", async ({ page }) => {
    const failures: string[] = []
    const check = async (path: string, include: string) => {
      const results = await new AxeBuilder({ page }).include(include).analyze()
      for (const item of results.violations) {
        if (item.impact !== "serious" && item.impact !== "critical") continue
        failures.push(`${path} ${include} ${item.id}`)
      }
    }

    await page.goto("/examples/crm")
    const bruma = page.getByRole("row", { name: /Taller Bruma/ })
    await bruma.getByRole("button", { name: "Taller Bruma", exact: true }).click()
    await check("/examples/crm", 'input[aria-label="Empresa Taller Bruma"]')

    await page.goto("/examples/onboarding")
    await page.getByRole("button", { name: /Equipo/ }).click()
    await check("/examples/onboarding", 'textarea')

    await page.goto("/examples/pipeline-board")
    await page.getByRole("button", { name: "Mostrar filtros" }).click()
    await check("/examples/pipeline-board", 'input[type="date"]')

    await page.goto("/examples/candidate-detail")
    await page.getByRole("button", { name: "Agendar" }).click()
    await check("/examples/candidate-detail", 'form[aria-label^="Agendar"]')

    await page.goto("/examples/json-viewer")
    await check("/examples/json-viewer", 'input[type="search"]')

    await page.goto("/examples/parameter-slider")
    await page.getByRole("button", { name: "0.40" }).click()
    await check("/examples/parameter-slider", 'input[aria-label="Variation"]')

    await page.goto("/examples/view-calendar")
    await check("/examples/view-calendar", 'input[type="month"]')

    await page.goto("/examples/bottom-sheet")
    await expect(page.locator('[data-slot="bottom-sheet"]')).toBeVisible()
    await check("/examples/bottom-sheet", '[data-slot="bottom-sheet"]')

    await page.goto("/examples/theme-toggle-icons")
    await expect(page.getByRole("button", { name: "eclipse" })).toBeVisible()
    await check("/examples/theme-toggle-icons", 'button[aria-label="eclipse"]')

    expect(failures).toEqual([])
  })
})
