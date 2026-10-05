"use client"

import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCompaniesTable } from "@/registry/ui/crm-companies-table"

import { crmMoney, crmTableLabels } from "../crm-labels"

export function Demo() {
  return (
    <CrmCompaniesTable
      rows={crmDemoCompanies}
      pageSize={6}
      formatValue={(value) => crmMoney.format(value)}
      labels={crmTableLabels}
    />
  )
}
