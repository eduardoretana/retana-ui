"use client"

import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCompaniesTable } from "@/registry/ui/crm-companies-table"

import { crmMoney, crmTableLabels } from "../crm-labels"

export default function CrmCompaniesTablePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <CrmCompaniesTable
        rows={crmDemoCompanies.slice(0, 3)}
        pageSize={3}
        formatValue={(value) => crmMoney.format(value)}
        labels={crmTableLabels}
      />
    </div>
  )
}
