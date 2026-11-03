import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { GuardApprovalQueue } from "@/registry/ui/guard-approval-queue"
import { GuardAuditLog } from "@/registry/ui/guard-audit-log"
import { GuardRuleBuilder } from "@/registry/ui/guard-rule-builder"
import { GuardRuleSimulator } from "@/registry/ui/guard-rule-simulator"
import {
  gitMergeApprovalRuleset,
  mejoravitWhatsappRuleset,
  syntheticGitMerge,
  syntheticSafeSend,
  syntheticUnvalidatedOffer,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"

const ruleset: Ruleset = { ...mejoravitWhatsappRuleset({ accountId: "marca-sintetica" }), version: 1 }
const offer = ruleset.rules[0]!
const token = "N".repeat(60)

describe("guard rule builder", () => {
  it("renders empty, loading, and error", () => {
    const { rerender } = render(<GuardRuleBuilder rule={null} locale="es" />)
    expect(screen.getByText("No hay regla")).toBeInTheDocument()
    rerender(<GuardRuleBuilder rule={null} locale="en" status="loading" />)
    expect(screen.getByRole("status", { name: "Loading the rule" })).toBeInTheDocument()
    rerender(<GuardRuleBuilder rule={offer} locale="en" status="error" errorMessage="No se pudo guardar la regla ficticia." />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar la regla ficticia.")
  })

  it("edits the name from the keyboard and locks a viewer", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<GuardRuleBuilder rule={offer} locale="en" onChange={onChange} />)
    const name = screen.getByLabelText("Name")
    await user.clear(name)
    await user.type(name, "Monto")
    expect(onChange).toHaveBeenCalled()
    expect(screen.getAllByText(/Before sending/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("option", { name: "is equal to" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("option", { name: "Offer type" }).length).toBeGreaterThan(0)
    render(<GuardRuleBuilder rule={{ ...offer, name: token }} readOnly onChange={onChange} locale="en" />)
    expect(screen.getByDisplayValue(token)).toBeDisabled()
  })

  it("adds a nested condition", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<GuardRuleBuilder rule={offer} locale="en" onChange={onChange} />)
    await user.click(screen.getAllByRole("button", { name: "Add condition" })[0]!)
    expect(onChange).toHaveBeenCalled()
  })
})

describe("guard rule simulator", () => {
  it("shows a block in Spanish and a fail-closed merge fact", () => {
    const first = render(<GuardRuleSimulator ruleset={ruleset} action={syntheticUnvalidatedOffer()} locale="es" clock={() => 0} />)
    expect(screen.getByRole("status", { name: "Decisión" })).toHaveTextContent("Bloquear")
    expect(screen.getByRole("status", { name: "Decisión" })).toHaveTextContent("validado")
    expect(screen.getByRole("status", { name: "Decisión" })).toHaveTextContent("Se activó")
    expect(screen.getByRole("status", { name: "Decisión" })).toHaveTextContent("Esta decidió")
    expect(screen.getByRole("status", { name: "Decisión" })).not.toHaveTextContent("fired")
    first.unmount()
    const merge: Ruleset = { ...gitMergeApprovalRuleset(), version: 1 }
    render(<GuardRuleSimulator ruleset={merge} action={syntheticGitMerge()} locale="en" clock={() => 0} />)
    expect(screen.getByText("Needs approval")).toBeInTheDocument()
  })

  it("fail-closes when a required fact is missing and covers empty, loading, and error", () => {
    const incomplete = { ...syntheticSafeSend(), data: { direction: "outbound" } }
    const missing = render(<GuardRuleSimulator ruleset={ruleset} action={incomplete} locale="es" clock={() => 0} />)
    const status = screen.getByRole("status", { name: "Decisión" })
    expect(status).toHaveTextContent("Requiere aprobación")
    expect(status).toHaveTextContent("Tema")
    expect(status).not.toHaveTextContent("Permitir")
    missing.unmount()
    const empty = render(<GuardRuleSimulator ruleset={null} action={null} locale="en" />)
    expect(screen.getByText("Nothing to simulate")).toBeInTheDocument()
    empty.unmount()
    const loading = render(<GuardRuleSimulator ruleset={ruleset} action={syntheticSafeSend()} status="loading" locale="en" />)
    expect(screen.getByRole("status", { name: "Simulating" })).toBeInTheDocument()
    loading.unmount()
    render(<GuardRuleSimulator ruleset={ruleset} action={syntheticSafeSend()} status="error" errorMessage="El ruleset ficticio no cargó." locale="es" />)
    expect(screen.getByRole("alert")).toHaveTextContent("El ruleset ficticio no cargó.")
  })
})

describe("guard approval queue", () => {
  const pending = {
    id: "apr_1",
    kind: "git.merge",
    reasonKey: "approval_git_merge",
    status: "pending" as const,
    expiresAt: 5_000,
    createdAt: 1_000,
    summary: "Merge ficticio de ejemplo/demo, pull request 0.",
  }

  it("approves from the keyboard and blocks viewers and expired tickets", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(<GuardApprovalQueue items={[pending]} now={1_500} role="approver" locale="en" onApprove={onApprove} onReject={vi.fn()} />)
    await user.tab()
    expect(screen.getByRole("button", { name: "Approve" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onApprove).toHaveBeenCalledWith("apr_1")
    const viewer = render(<GuardApprovalQueue items={[pending]} now={1_500} role="viewer" locale="en" onApprove={onApprove} onReject={vi.fn()} />)
    expect(screen.getAllByRole("button", { name: "Approve" }).at(-1)).toBeDisabled()
    viewer.unmount()
    render(<GuardApprovalQueue items={[{ ...pending, expiresAt: 100 }]} now={1_500} role="approver" locale="es" onApprove={onApprove} onReject={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Aprobar" })).toBeDisabled()
    expect(screen.getByText("expired")).toBeInTheDocument()
  })

  it("renders empty, loading, and error", () => {
    const empty = render(<GuardApprovalQueue items={[]} now={0} locale="en" />)
    expect(screen.getByText("No approvals")).toBeInTheDocument()
    empty.unmount()
    const loading = render(<GuardApprovalQueue items={[]} now={0} status="loading" locale="en" />)
    expect(screen.getByRole("status", { name: "Loading approvals" })).toBeInTheDocument()
    loading.unmount()
    render(<GuardApprovalQueue items={[pending]} now={0} status="error" errorMessage="La cola ficticia falló." locale="es" />)
    expect(screen.getByRole("alert")).toHaveTextContent("La cola ficticia falló.")
  })
})

describe("guard audit log", () => {
  const entry = {
    id: "aud_1",
    createdAt: Date.UTC(2026, 10, 3, 15, 0, 0),
    kind: "whatsapp.before_send",
    decision: "block" as const,
    summary: token,
    ruleIds: ["block-unvalidated-offer", "log-all"],
    rulesetVersion: 1,
    accountId: "marca-sintetica",
    agentResponse: "Respuesta ficticia que no se envió.",
    approver: "revisor-ficticio",
  }

  it("shows the entry, keeps it append-only in the UI, and covers the other states", () => {
    const filled = render(<GuardAuditLog entries={[entry]} locale="es" />)
    expect(screen.getByText(token)).toBeInTheDocument()
    expect(screen.getByText("Bloquear")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /borrar|eliminar|delete/i })).toBeNull()
    filled.unmount()
    const empty = render(<GuardAuditLog entries={[]} locale="en" />)
    expect(screen.getByText("The audit log is empty")).toBeInTheDocument()
    empty.unmount()
    const loading = render(<GuardAuditLog entries={[]} status="loading" locale="en" />)
    expect(screen.getByRole("status", { name: "Loading the audit log" })).toBeInTheDocument()
    loading.unmount()
    render(<GuardAuditLog entries={[]} status="error" errorMessage="No se leyó la bitácora ficticia." locale="es" />)
    expect(screen.getByRole("alert")).toHaveTextContent("No se leyó la bitácora ficticia.")
  })
})
