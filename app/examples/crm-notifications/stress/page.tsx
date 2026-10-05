"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { crmDemoNotices } from "@/registry/lib/crm-demo-data"
import { CrmNotifications } from "@/registry/ui/crm-notifications"
import type { CrmNotice } from "@/registry/lib/crm-companies"

const many: CrmNotice[] = Array.from({ length: 20 }, (_, index) => ({
  id: `n${index}`,
  title: `Aviso ${index + 1}`,
  description: "Una línea de seguimiento.",
  time: `${index + 1} h`,
  read: index > 2,
}))

const long: CrmNotice = {
  id: "long",
  title: unbreakable,
  description: unbreakable,
  time: "ahora",
}

export default function CrmNotificationsStressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · avisos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Vacío, uno, veinte, título sin espacios y RTL.</p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <div className="flex justify-end">
          <CrmNotifications defaultItems={crmDemoNotices} labels={{ label: "Avisos" }} />
        </div>
      </StressCase>
      <StressCase label="Vacío">
        <CrmNotifications items={[]} labels={{ empty: "Sin avisos" }} />
      </StressCase>
      <StressCase label="Uno">
        <CrmNotifications defaultItems={[crmDemoNotices[0]]} />
      </StressCase>
      <StressCase label="Veinte" width={320}>
        <CrmNotifications defaultItems={many} />
      </StressCase>
      <StressCase label="Título largo" width={320}>
        <CrmNotifications defaultItems={[long]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <CrmNotifications
            labels={{ label: "التنبيهات", empty: "لا شيء" }}
            defaultItems={[{ id: "rtl", title: "مكالمة", description: "إيلينا سجّلت مكالمة.", time: "الآن" }]}
          />
        </div>
      </StressCase>
    </main>
  )
}
