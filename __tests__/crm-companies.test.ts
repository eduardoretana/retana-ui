import { describe, expect, it } from "vitest"

import { companiesToCsv } from "@/registry/ui/crm-companies-table"
import {
  companyDraftIssues,
  companyFromDraft,
  EMPTY_COMPANY_DRAFT,
  filterCompanies,
  paginate,
  sortCompanies,
  toggleFacetValue,
  type CrmCompany,
} from "@/registry/lib/crm-companies"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"

const rows = crmDemoCompanies

describe("crm company model", () => {
  it("filters by search, segment, and every selected facet", () => {
    const searched = filterCompanies(rows, { search: "lince" })
    expect(searched.map((company) => company.id)).toEqual(["lince"])

    const leads = filterCompanies(rows, { segment: "lead" })
    expect(leads.every((company) => company.status === "lead")).toBe(true)

    const facets = toggleFacetValue(toggleFacetValue({}, "region", "Oaxaca"), "industry", "Cerámica")
    const both = filterCompanies(rows, { facets })
    expect(both.map((company) => company.id)).toEqual(["valle"])
  })

  it("sorts pipeline descending and pages the result", () => {
    const sorted = sortCompanies(rows, { key: "pipeline", direction: "desc" })
    expect(sorted[0]?.id).toBe("lumen")
    expect(sorted.at(-1)?.pipelineValue).toBe(0)
    const page = paginate(sorted, 1, 5)
    expect(page.page).toBe(1)
    expect(page.rows).toHaveLength(5)
    expect(page.start).toBe(5)
  })

  it("escapes a spreadsheet formula in the CSV helper", () => {
    const risky: CrmCompany = {
      ...rows[0],
      name: "=cmd()",
      statusLabel: "Activa",
    }
    const csv = companiesToCsv([risky], { name: "Empresa" })
    expect(csv.startsWith("Empresa,")).toBe(true)
    expect(csv).toContain("'=cmd()")
  })

  it("reports draft issues and builds a company once they are clear", () => {
    expect(companyDraftIssues(EMPTY_COMPANY_DRAFT)).toEqual([
      "name-required",
      "status-required",
      "owner-required",
      "pipeline-invalid",
    ])
    expect(companyDraftIssues({ ...EMPTY_COMPANY_DRAFT, email: "nope", name: "A", status: "lead", ownerId: "elena", pipelineValue: "10" })).toContain(
      "email-invalid",
    )
    expect(
      companyDraftIssues({
        ...EMPTY_COMPANY_DRAFT,
        name: "A",
        status: "lead",
        ownerId: "elena",
        pipelineValue: "10",
        logo: { type: "text/plain", size: 10 },
      }),
    ).toContain("logo-type")

    const company = companyFromDraft(
      { ...EMPTY_COMPANY_DRAFT, name: "  Taller  ", status: "lead", ownerId: "elena", pipelineValue: "1200", industry: "Cerámica" },
      { id: "taller", ownerName: "Elena Voss", statusLabel: "Prospecto", statusTone: "neutral", activityLabel: "recién creada" },
    )
    expect(company).toMatchObject({ id: "taller", name: "Taller", owner: "Elena Voss", pipelineValue: 1200, industry: "Cerámica" })
  })
})
