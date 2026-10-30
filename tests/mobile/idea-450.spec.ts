import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const steps = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const
const expectedPx: Record<(typeof steps)[number], string> = {
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "14px",
  "2xl": "18px",
  "3xl": "22px",
  "4xl": "26px",
}

function channel(value: number) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map(channel) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: [number, number, number], b: [number, number, number]) {
  const L1 = luminance(a)
  const L2 = luminance(b)
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

async function paint(page: Page, theme: "light" | "dark") {
  await page.addInitScript((next) => {
    localStorage.setItem("theme", next)
  }, theme)
  await page.goto("/review/idea-450", { waitUntil: "networkidle" })
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" })
  if (theme === "dark") {
    await page.evaluate(() => document.documentElement.classList.add("dark"))
  }
}

test.describe("IDEA-450 390", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`badge neutro ≥3:1 y el texto ≥4.5:1 en ${theme}`, async ({ page }) => {
      await paint(page, theme)
      const ratio = await page.locator("[data-variant=count]").evaluate((badge) => {
        const sample = (value: string) => {
          const canvas = document.createElement("canvas")
          canvas.width = 1
          canvas.height = 1
          const context = canvas.getContext("2d")
          if (!context) throw new Error("canvas")
          context.fillStyle = value
          context.fillRect(0, 0, 1, 1)
          const [r, g, b] = context.getImageData(0, 0, 1, 1).data
          return [r, g, b] as [number, number, number]
        }
        return {
          pageBg: sample(getComputedStyle(document.body).backgroundColor),
          badgeBg: sample(getComputedStyle(badge).backgroundColor),
          text: sample(getComputedStyle(badge).color),
          dot: sample(getComputedStyle(badge.parentElement?.querySelector("[data-variant=dot]") ?? badge).backgroundColor),
        }
      })
      expect(contrast(ratio.badgeBg, ratio.pageBg)).toBeGreaterThanOrEqual(3)
      expect(contrast(ratio.text, ratio.badgeBg)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(ratio.dot, ratio.pageBg)).toBeGreaterThanOrEqual(3)
      await expect(page.locator("[aria-label='3 sin leer']").first()).toBeVisible()
    })

    test(`el fallback opaco del header mantiene texto ≥4.5:1 en ${theme}`, async ({ page }) => {
      await paint(page, theme)
      const colors = await page.locator("[data-glass=floating]").first().evaluate((el) => {
        const probe = document.createElement("div")
        probe.className = "bg-background text-foreground"
        document.body.appendChild(probe)
        const sample = (value: string) => {
          const canvas = document.createElement("canvas")
          canvas.width = 1
          canvas.height = 1
          const context = canvas.getContext("2d")
          if (!context) throw new Error("canvas")
          context.fillStyle = value
          context.fillRect(0, 0, 1, 1)
          const [r, g, b] = context.getImageData(0, 0, 1, 1).data
          return [r, g, b] as [number, number, number]
        }
        const bg = sample(getComputedStyle(probe).backgroundColor)
        const fg = sample(getComputedStyle(probe).color)
        probe.remove()
        return { bg, fg, className: el.className }
      })
      expect(colors.className).toContain("bg-background")
      expect(colors.className).toContain("supports-[backdrop-filter]:")
      expect(contrast(colors.fg, colors.bg)).toBeGreaterThanOrEqual(4.5)
    })
  }

  test("las cuatro escenas del círculo no desbordan a 390", async ({ page }) => {
    for (const scene of ["filled", "empty", "loading", "error"]) {
      await page.goto(`/examples/avatar-group?scene=${scene}`, { waitUntil: "networkidle" })
      const box = page.locator("[data-slot=scene-frame], main").first()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, scene).toBeLessThanOrEqual(1)
      await expect(box).toBeVisible()
    }
  })

  test("los radios computados igualan los px de CPL", async ({ page }) => {
    await page.goto("/review/idea-450", { waitUntil: "networkidle" })
    const measured = await page.locator("[data-radius]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        step: node.getAttribute("data-radius"),
        px: getComputedStyle(node).borderTopLeftRadius,
      })),
    )
    for (const step of steps) {
      expect(measured.find((row) => row.step === step)?.px).toBe(expectedPx[step])
    }
  })

  test("axe no marca serious ni critical en el círculo y el badge", async ({ page }) => {
    await paint(page, "light")
    const results = await new AxeBuilder({ page }).include("[data-shot=badge-new]").include("#circle").analyze()
    const serious = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical")
    expect(serious.map((item) => `${item.id} ${item.nodes.map((node) => node.target.join(" ")).join(" | ")}`)).toEqual([])
  })
})
