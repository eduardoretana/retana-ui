"use client"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { NotificationStack, type NotificationStackItem, type NotificationTone } from "@/registry/ui/notification-stack"

import { sampleNotices } from "../sample"

const tones: NotificationTone[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "primary"]

function many(count: number): NotificationStackItem[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `notice-${number}`,
      title: `Aviso ${number}`,
      body: "Una línea más en la misma pila.",
      time: `${number}m`,
      dateTime: "2026-10-04T12:00:00",
      tone: tones[index % tones.length],
    }
  })
}

export default function NotificationStackStressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold">Estrés · pila de avisos</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            320px, vacío, uno, cuatro, cuarenta, título sin espacios, RTL, emoji y un hermano en el mismo flex.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <StressCase label="320px" width={320}>
        <NotificationStack defaultItems={sampleNotices} label="Avisos estrechos" />
      </StressCase>
      <StressCase label="Vacío">
        <NotificationStack items={[]} emptyLabel="Nada por aquí" />
      </StressCase>
      <StressCase label="Uno">
        <NotificationStack defaultItems={[sampleNotices[0]]} expandable={false} />
      </StressCase>
      <StressCase label="Cuatro">
        <NotificationStack defaultItems={sampleNotices} expandable={false} />
      </StressCase>
      <StressCase label="Cuarenta" width={320}>
        <NotificationStack defaultItems={many(40)} label="Cuarenta avisos" />
      </StressCase>
      <StressCase label="Título largo" width={320}>
        <NotificationStack
          expandable={false}
          defaultItems={[
            {
              id: "long",
              title: unbreakable,
              body: `${unbreakable} ${unbreakable}`,
              time: "03:00",
              dateTime: "2026-10-04T03:00:00",
              tone: "chart-5",
            },
          ]}
        />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <NotificationStack
            label="التنبيهات"
            expandLabel="عرض الكل"
            collapseLabel="تكديس"
            emptyLabel="لا شيء جديد"
            defaultItems={[
              {
                id: "rtl-1",
                title: "رسالة جديدة",
                body: "إينيس أرسلت ملاحظة عن الفرن.",
                time: "٢د",
                tone: "chart-1",
              },
              {
                id: "rtl-2",
                title: "تعليق جديد",
                body: "لوشيا علّقت على اختبار الطلاء.",
                time: "١٥د",
                tone: "chart-3",
              },
            ]}
          />
        </div>
      </StressCase>
      <StressCase label="Emoji" width={320}>
        <NotificationStack
          expandable={false}
          defaultItems={[
            {
              id: "emoji",
              title: "🔥 Horno listo",
              body: "La pieza 🏺 salió bien. 🎉",
              time: "1m",
              tone: "primary",
            },
          ]}
        />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex max-w-lg items-start gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
            16
          </div>
          <NotificationStack className="max-w-none" defaultItems={sampleNotices.slice(0, 2)} expandable={false} />
        </div>
      </StressCase>
      <StressCase label="Muy ancho">
        <div className="w-full max-w-4xl">
          <NotificationStack defaultItems={sampleNotices.slice(0, 3)} />
        </div>
      </StressCase>
    </main>
  )
}
