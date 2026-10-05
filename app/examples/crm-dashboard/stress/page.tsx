"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { CrmDashboard } from "@/registry/blocks/crm-dashboard"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import type { CrmCompany } from "@/registry/lib/crm-companies"

const long: CrmCompany = { ...crmDemoCompanies[0], id: "long", name: unbreakable, owner: unbreakable }
const emoji: CrmCompany = { ...crmDemoCompanies[1], id: "emoji", name: "🏠 Café ☀️" }
const many = Array.from({ length: 24 }, (_, index) => ({
  ...crmDemoCompanies[index % crmDemoCompanies.length],
  id: `row-${index}`,
  name: `Empresa ${index + 1}`,
}))

export default function CrmDashboardStressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · CRM de ventas</h1>
          <p className="mt-2 text-sm text-muted-foreground">320px, vacío, uno, veinticuatro, nombre sin espacios, emoji y RTL.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <CrmDashboard companies={crmDemoCompanies.slice(0, 4)} notices={[]} />
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <CrmDashboard companies={[]} notices={[]} />
      </StressCase>
      <StressCase label="Uno">
        <CrmDashboard companies={crmDemoCompanies.slice(0, 1)} notices={[]} />
      </StressCase>
      <StressCase label="Veinticuatro" width={320}>
        <CrmDashboard companies={many} notices={[]} />
      </StressCase>
      <StressCase label="Nombre largo" width={320}>
        <CrmDashboard companies={[long]} notices={[]} />
      </StressCase>
      <StressCase label="Emoji" width={320}>
        <CrmDashboard companies={[emoji]} notices={[]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <CrmDashboard companies={[{ ...crmDemoCompanies[4], name: "راديو" }]} notices={[]} />
        </div>
      </StressCase>
    </main>
  )
}
