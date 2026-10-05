"use client"

/** Clean-room clarify step. Answers rewrite hours, price, and the reason list. */

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  clarificationImpact,
  formatHours,
  formatMoney,
  type ClarifyQuestion,
} from "@/registry/retana/lib/proposal"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { TextMorph } from "@/registry/retana/ui/text-morph"

export type ProposalClarifyProps = {
  questions: readonly ClarifyQuestion[]
  answers: Readonly<Record<string, string>>
  onAnswer: (questionId: string, value: string) => void
  baseHours: number
  rate: number
  hoursPerWeek?: number
  locale?: string
  currency?: string
  hoursLabel?: string
  previousLabel?: string
  reasonsLabel?: string
  emptyReasons?: string
  priceLabel?: string
  timelineLabel?: string
  weeksSuffix?: string
  className?: string
}

export function ProposalClarify({
  questions,
  answers,
  onAnswer,
  baseHours,
  rate,
  hoursPerWeek = 30,
  locale = "en-US",
  currency = "USD",
  hoursLabel = "Hours",
  previousLabel = "Previous",
  reasonsLabel = "Why it changed",
  emptyReasons = "No change yet",
  priceLabel = "Price range",
  timelineLabel = "Timeline",
  weeksSuffix = "wk",
  className,
}: ProposalClarifyProps) {
  const impact = clarificationImpact({ baseHours, questions, answers, rate, hoursPerWeek })
  const hours = formatHours(impact.next, locale)
  const previous = formatHours(impact.previous, locale)

  return (
    <div data-slot="proposal-clarify" className={cn("grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]", className)}>
      <div className="grid min-w-0 gap-3">
        {questions.map((question) => (
          <article key={question.id} className="min-w-0 rounded-xl border border-border bg-card p-3">
            <h2 className="text-sm font-medium wrap-break-word">{question.prompt}</h2>
            {question.detail ? <p className="mt-1 text-xs text-muted-foreground">{question.detail}</p> : null}
            <SegmentedControl
              className="mt-3"
              label={question.prompt}
              options={question.options.map((option) => ({ value: option.value, label: option.label }))}
              value={answers[question.id]}
              onValueChange={(value) => onAnswer(question.id, value)}
            />
          </article>
        ))}
      </div>
      <aside className="h-fit rounded-xl border border-border bg-muted/30 p-4" aria-live="polite">
        <p className="text-xs text-muted-foreground">{hoursLabel}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-sm text-muted-foreground line-through tabular-nums">
            <span className="sr-only">{previousLabel} </span>
            {previous}
          </span>
          <TextMorph className="text-2xl font-medium tabular-nums">{hours}</TextMorph>
          <Badge variant="outline" data-slot="proposal-delta">
            {impact.delta > 0 ? "+" : ""}
            {formatHours(impact.delta, locale)}
          </Badge>
        </p>
        <h2 className="mt-4 text-sm font-medium">{reasonsLabel}</h2>
        {impact.reasons.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">{emptyReasons}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {impact.reasons.map((reason) => (
              <li key={reason.id} className="flex justify-between gap-3">
                <span className="min-w-0 wrap-break-word">{reason.label}</span>
                <span className="shrink-0 tabular-nums">
                  {reason.hours > 0 ? "+" : ""}
                  {formatHours(reason.hours, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{priceLabel}</dt>
            <dd className="text-end tabular-nums">
              {formatMoney(impact.priceLow, locale, currency)} – {formatMoney(impact.priceHigh, locale, currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{timelineLabel}</dt>
            <dd className="tabular-nums">
              {formatHours(impact.weeksLow, locale)}–{formatHours(impact.weeksHigh, locale)} {weeksSuffix}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  )
}
