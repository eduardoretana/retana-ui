"use client"

import { Badge } from "@/components/ui/badge"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"

import { crmMoney } from "../crm-labels"

const company = crmDemoCompanies[0]

export default function CrmCompanyDetailPreview() {
  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden bg-background p-3">
      <p className="truncate text-sm font-medium">{company.name}</p>
      <div className="flex items-center gap-2">
        <Badge>{company.statusLabel}</Badge>
        <span className="text-xs text-muted-foreground tabular-nums">{crmMoney.format(company.pipelineValue)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Puntuación {company.score}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full bg-primary" style={{ width: `${company.score}%` }} />
      </div>
    </div>
  )
}
