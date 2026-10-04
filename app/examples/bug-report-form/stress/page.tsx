"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { BugReportForm, type BugReportType } from "@/registry/ui/bug-report-form"

const manyTypes: BugReportType[] = Array.from({ length: 10 }, (_, index) => ({
  value: `type-${index + 1}`,
  label: `Type ${index + 1}`,
}))

export default function BugReportFormStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · reporte de error</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, un título sin espacios, dirección RTL, diez tipos, emoji y el formulario deshabilitado.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <BugReportForm />
      </StressCase>
      <StressCase label="Título largo" width={320}>
        <BugReportForm defaultValues={{ title: unbreakable, description: unbreakable }} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <BugReportForm
            labels={{
              title: "الإبلاغ عن خطأ",
              subtitle: "ساعدنا على تحسين التجربة",
              titleField: "العنوان",
              descriptionField: "الوصف",
              typeField: "نوع الخطأ",
              priorityField: "الأولوية",
              environmentField: "البيئة",
            }}
            types={[
              { value: "ui", label: "واجهة" },
              { value: "functionality", label: "سلوك" },
            ]}
            priorities={[
              { value: "low", label: "منخفض", tone: "muted" },
              { value: "high", label: "عالٍ", tone: "destructive" },
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Diez tipos" width={320}>
        <BugReportForm types={manyTypes} defaultValues={{ type: "type-1" }} />
      </StressCase>
      <StressCase label="Emoji" width={320}>
        <BugReportForm
          defaultValues={{
            title: "El botón tapa el campo 🐛",
            description: "Pasa en ajustes ✨ cuando el teclado está abierto 📱.",
            type: "ui",
          }}
        />
      </StressCase>
      <StressCase label="Deshabilitado" width={320}>
        <BugReportForm disabled defaultValues={{ title: "Solo lectura", type: "other", priority: "low" }} />
      </StressCase>
    </main>
  )
}
