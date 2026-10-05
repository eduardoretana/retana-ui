"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { crmDemoCompanies } from "@/registry/lib/crm-demo-data"
import { CrmCompaniesTable } from "@/registry/ui/crm-companies-table"
import type { CrmCompany } from "@/registry/lib/crm-companies"

import { crmMoney, crmTableLabels } from "../../crm-labels"

const long: CrmCompany = {
  ...crmDemoCompanies[0],
  id: "long",
  name: unbreakable,
  owner: unbreakable,
  statusLabel: unbreakable,
}

const emoji: CrmCompany = {
  ...crmDemoCompanies[1],
  id: "emoji",
  name: "🏠 Café ☀️",
  owner: "🙂",
}

const many = Array.from({ length: 40 }, (_, index) => ({
  ...crmDemoCompanies[index % crmDemoCompanies.length],
  id: `many-${index}`,
  name: `Empresa ${index + 1}`,
}))

export default function CrmCompaniesTableStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · tabla de empresas</h1>
          <p className="mt-2 text-sm text-muted-foreground">320px, vacío, uno, cuarenta, nombre sin espacios, emoji, RTL y carga.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <CrmCompaniesTable rows={crmDemoCompanies.slice(0, 4)} pageSize={4} formatValue={(value) => crmMoney.format(value)} labels={crmTableLabels} />
      </StressCase>
      <StressCase label="Vacío">
        <CrmCompaniesTable rows={[]} labels={crmTableLabels} />
      </StressCase>
      <StressCase label="Uno">
        <CrmCompaniesTable rows={crmDemoCompanies.slice(0, 1)} labels={crmTableLabels} />
      </StressCase>
      <StressCase label="Cuarenta" width={320}>
        <CrmCompaniesTable rows={many} pageSize={10} labels={crmTableLabels} />
      </StressCase>
      <StressCase label="Nombre largo" width={320}>
        <CrmCompaniesTable rows={[long]} labels={crmTableLabels} />
      </StressCase>
      <StressCase label="Emoji">
        <CrmCompaniesTable rows={[emoji]} labels={crmTableLabels} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <CrmCompaniesTable rows={crmDemoCompanies.slice(0, 2)} labels={{ ...crmTableLabels, caption: "الشركات", empty: "لا شيء" }} />
        </div>
      </StressCase>
      <StressCase label="Cargando">
        <CrmCompaniesTable rows={crmDemoCompanies} loading labels={crmTableLabels} />
      </StressCase>
      <StressCase label="Con un hermano">
        <div className="flex min-w-0 gap-3">
          <div className="w-24 shrink-0 rounded-lg border border-border p-2 text-xs">Notas</div>
          <div className="min-w-0 flex-1">
            <CrmCompaniesTable rows={crmDemoCompanies.slice(0, 2)} labels={crmTableLabels} />
          </div>
        </div>
      </StressCase>
    </main>
  )
}
