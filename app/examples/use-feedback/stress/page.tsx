"use client"

import { Button } from "@/components/ui/button"
import { StressCase } from "@/app/examples/stress-case"
import { useFeedback, type FeedbackIntent } from "@/registry/hooks/use-feedback"

const intents: FeedbackIntent[] = ["tap", "success", "error", "ready", "attention"]

export default function StressPage() {
  const feedback = useFeedback()
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Feedback</h1>
      <StressCase label="320px" width={320}>
        <div className="flex flex-wrap gap-2">
          {intents.map((intent) => (
            <Button key={intent} type="button" variant="outline" onClick={() => feedback.trigger(intent)}>
              {intent}
            </Button>
          ))}
        </div>
      </StressCase>
      <StressCase label="Cadena larga" width={320}>
        <Button type="button" className="max-w-full" onClick={() => feedback.trigger("confirm")}>
          <span className="truncate">ConfirmaciónSinEspaciosDelFeedback</span>
        </Button>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <Button type="button" onClick={() => feedback.trigger("success")}>تم</Button>
        </div>
      </StressCase>
    </main>
  )
}
