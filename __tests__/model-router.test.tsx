import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { formatRouterAmount } from "@/registry/lib/model-router-cost"
import { withShare, type RouterPolicy } from "@/registry/lib/model-router"
import { ModelRouter } from "@/registry/ui/model-router"

const environments = [
  { id: "bandeja", label: "Bandeja demo" },
  { id: "borrador", label: "Borrador demo" },
]

function route(id: string, share: number, amount = 0.2): RouterPolicy["routes"][number] {
  return {
    id,
    name: id === "a" ? "Bruma breve" : id === "b" ? "Cumbre media" : "Patio local",
    vendor: "Taller demo",
    share,
    metrics: { p95Ms: 800, p99Ms: 2100, amountPer1k: amount, errorRate: 0.004 },
  }
}

function policy(shares: [number, number, number] = [34, 33, 33]): RouterPolicy {
  return {
    id: "pol-3",
    name: "Política v3",
    environmentId: "bandeja",
    preset: "balanced",
    routes: [route("a", shares[0], 0.1), route("b", shares[1], 0.4), route("c", shares[2], 0.2)],
    fallback: { enabled: true, modelIds: ["a", "b"] },
  }
}

function Harness({
  initial = policy(),
  deployed = policy(),
  onDeployRequest = async () => {},
  readOnly = false,
  status = "ready" as const,
  currency = "MXN",
}: {
  initial?: RouterPolicy
  deployed?: RouterPolicy
  onDeployRequest?: (policy: RouterPolicy) => Promise<void>
  readOnly?: boolean
  status?: "ready" | "loading" | "error"
  currency?: string
}) {
  const [current, setCurrent] = useState(initial)
  return (
    <ModelRouter
      policy={current}
      deployed={deployed}
      environments={environments}
      onPolicyChange={setCurrent}
      onDeployRequest={onDeployRequest}
      readOnly={readOnly}
      status={status}
      error={status === "error" ? "No se pudo leer la política." : undefined}
      locale="es-MX"
      currency={currency}
    />
  )
}

describe("ModelRouter", () => {
  it("shows the blended per-1K amount in the chosen currency", () => {
    render(<Harness />)
    const draft = policy()
    const expected = formatRouterAmount(
      draft.routes.reduce((sum, item) => sum + (item.share / 100) * (item.metrics?.amountPer1k ?? 0), 0),
      { locale: "es-MX", currency: "MXN" },
    )
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it("keeps shares at 100 when a slider moves", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const slider = screen.getByRole("slider", { name: "Share for Bruma breve" })
    slider.focus()
    await user.keyboard("{ArrowRight}")
    const values = screen.getAllByRole("slider").map((node) => Number(node.getAttribute("aria-valuenow")))
    expect(values[0]).toBe(35)
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(100)
  })

  it("applies the cost preset from the segmented control", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole("button", { name: "Cost" }))
    const values = screen.getAllByRole("slider").map((node) => Number(node.getAttribute("aria-valuenow")))
    expect(values.reduce((sum, value) => sum + value, 0)).toBe(100)
    expect(values[0]).toBeGreaterThan(values[1] ?? 0)
  })

  it("reorders the fallback chain from the keyboard", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const first = screen.getByRole("listitem", { name: /Bruma breve, step 1/ })
    first.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("listitem", { name: /Cumbre media, step 1/ })).toBeInTheDocument()
  })

  it("rolls the editor back to the submitted draft when deploy fails", async () => {
    const user = userEvent.setup()
    const onDeployRequest = vi.fn(async () => {
      throw new Error("red")
    })
    const initial = withShare(policy(), "a", 50)
    render(<Harness initial={initial} deployed={policy()} onDeployRequest={onDeployRequest} />)
    await user.click(screen.getByRole("button", { name: "Deploy policy" }))
    expect(await screen.findByText("The policy was not deployed. The editor shows this draft again.")).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Share for Bruma breve" })).toHaveAttribute("aria-valuenow", "50")
    expect(onDeployRequest).toHaveBeenCalledTimes(1)
  })

  it("hides deploy when the role is read-only and shows empty, loading, and error", () => {
    const { rerender } = render(<Harness readOnly />)
    expect(screen.queryByRole("button", { name: "Deploy policy" })).not.toBeInTheDocument()
    expect(screen.getByText(/not available for this role/)).toBeInTheDocument()

    rerender(
      <ModelRouter
        policy={{ ...policy(), routes: [] }}
        deployed={{ ...policy(), routes: [] }}
        environments={environments}
        onPolicyChange={() => {}}
        onDeployRequest={async () => {}}
      />,
    )
    expect(screen.getByText("No models")).toBeInTheDocument()

    rerender(
      <ModelRouter
        policy={policy()}
        deployed={policy()}
        environments={environments}
        status="loading"
        onPolicyChange={() => {}}
        onDeployRequest={async () => {}}
      />,
    )
    expect(screen.getByLabelText("Loading the policy")).toBeInTheDocument()

    rerender(
      <ModelRouter
        policy={policy()}
        deployed={policy()}
        environments={environments}
        status="error"
        error="The catalog timed out."
        onPolicyChange={() => {}}
        onDeployRequest={async () => {}}
      />,
    )
    expect(screen.getByText("The catalog timed out.")).toBeInTheDocument()
  })

  it("omits particles when reduced motion is on", () => {
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    render(<Harness />)
    expect(screen.getByRole("figure")).toHaveAttribute("data-particles", "off")
    expect(document.querySelector("[data-particle]")).toBeNull()
  })
})
