"use client"

import { useState } from "react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { Button } from "@/components/ui/button"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCompanyDetail } from "@/registry/ui/crm-company-detail"
import type { CrmCompany } from "@/registry/lib/crm-companies"

function Open({ company, label }: { company: CrmCompany; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <CrmCompanyDetail company={company} open={open} onOpenChange={setOpen} />
    </>
  )
}

const long: CrmCompany = {
  ...crmDemoCompanies[0],
  name: unbreakable,
  owner: unbreakable,
  notes: unbreakable,
  industry: "🏺",
}

const emptyTrend: CrmCompany = { ...crmDemoCompanies[2], trend: [], activity: [1] }

export default function CrmCompanyDetailStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · ficha de empresa</h1>
          <p className="mt-2 text-sm text-muted-foreground">Nombre sin espacios, sin tendencia, emoji y RTL. El panel ocupa el ancho en 320px.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="Nombre largo" width={320}>
        <Open company={long} label="Abrir nombre largo" />
      </StressCase>
      <StressCase label="Sin tendencia">
        <Open company={emptyTrend} label="Abrir sin tendencia" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Open company={{ ...crmDemoCompanies[1], name: "متحف النهر" }} label="فتح" />
        </div>
      </StressCase>
    </main>
  )
}
