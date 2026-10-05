"use client"

import { Badge } from "@/components/ui/badge"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"

import { crmMoney } from "../crm-labels"

export default function CrmCommandMenuPreview() {
  return (
    <div className="flex h-full flex-col gap-1 overflow-hidden bg-popover p-2">
      <p className="px-1 text-xs text-muted-foreground">Buscar empresas</p>
      {crmDemoCompanies.slice(0, 3).map((company) => (
        <div key={company.id} className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-xs">
          <span className="min-w-0 flex-1 truncate">{company.name}</span>
          <Badge variant="secondary">{company.statusLabel}</Badge>
          <span className="tabular-nums">{crmMoney.format(company.pipelineValue)}</span>
        </div>
      ))}
    </div>
  )
}
