"use client"

/** Adapted from Arc UI (MIT). */

import { useId, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { BillingPrice } from "@/registry/retana/ui/billing-toggle"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"

export type PlanId = "studio" | "workshop"
export type PlanBilling = "monthly" | "yearly"

export type PlanFeature = {
  label: string
  studio: string
  workshop: string
  shared?: boolean
}

export type PlanComparisonClassNames = {
  root?: string
  intro?: string
  matrix?: string
  footer?: string
}

export type PlanComparisonProps = {
  title?: string
  description?: string
  features?: PlanFeature[]
  className?: string
  classNames?: PlanComparisonClassNames
}

const defaultFeatures: PlanFeature[] = [
  { label: "Active firings", studio: "Unlimited", workshop: "Unlimited", shared: true },
  { label: "Shared benches", studio: "1 bench", workshop: "Unlimited" },
  { label: "Guest reviewers", studio: "5 per firing", workshop: "Unlimited" },
  { label: "Version history", studio: "30 days", workshop: "Unlimited" },
  { label: "Approval flows", studio: "Not included", workshop: "Included" },
  { label: "Custom roles", studio: "Not included", workshop: "Included" },
  { label: "Glaze exports", studio: "Included", workshop: "Included", shared: true },
  { label: "Support", studio: "Email", workshop: "Priority email" },
]

const pricing: Record<PlanId, Record<PlanBilling, number>> = {
  studio: { monthly: 24, yearly: 19 },
  workshop: { monthly: 64, yearly: 51 },
}

const plans: { id: PlanId; name: string; detail: string }[] = [
  { id: "studio", name: "Studio", detail: "One kiln, shared gallery" },
  { id: "workshop", name: "Workshop", detail: "Three kilns and wholesale" },
]

function Value({ text }: { text: string }) {
  if (text === "Included") {
    return (
      <span className="inline-flex items-center gap-1.5 text-foreground">
        <Check className="size-4 text-primary" aria-hidden="true" />
        Included
      </span>
    )
  }
  return <span className={text === "Not included" ? "text-muted-foreground" : undefined}>{text}</span>
}

export function PlanComparison({
  title = "Room for the way the studio works",
  description = "Only the details that change between plans. Switch billing to see what Costa Atelier would pay.",
  features = defaultFeatures,
  className,
  classNames,
}: PlanComparisonProps) {
  const id = useId()
  const filterId = useId()
  const reduce = !!useReducedMotion()
  const [billing, setBilling] = useState<PlanBilling>("monthly")
  const [differencesOnly, setDifferencesOnly] = useState(false)
  const [selected, setSelected] = useState<PlanId | null>(null)
  const visibleFeatures = differencesOnly ? features.filter((feature) => !feature.shared) : features

  return (
    <Card
      data-slot="plan-comparison"
      role="region"
      aria-labelledby={`${id}-title`}
      className={cn("@container w-full min-w-0 max-w-5xl gap-0 overflow-hidden py-0 text-sm", className, classNames?.root)}
    >
      <div className={cn("flex items-end justify-between gap-6 p-8 @max-[720px]:flex-col @max-[720px]:items-start @max-[720px]:p-5", classNames?.intro)}>
        <div className="min-w-0 max-w-xl">
          <h2 id={`${id}-title`} className="text-2xl font-medium text-balance @min-[541px]:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-prose text-pretty text-muted-foreground">{description}</p>
        </div>
        <div className="grid justify-items-end gap-1.5 @max-[720px]:justify-items-start">
          <SegmentedControl
            label="Billing period"
            value={billing}
            onValueChange={(value) => setBilling(value as PlanBilling)}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <small className="min-h-4 text-xs text-muted-foreground tabular-nums">
            {billing === "yearly" ? "Billed yearly, save up to 23%" : "Billed month to month"}
          </small>
        </div>
      </div>

      <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-t border-border px-8 py-2 @max-[720px]:px-5 @max-[340px]:px-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h3 className="text-sm font-medium">Compare plans</h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {visibleFeatures.length} of {features.length} features
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={filterId} checked={differencesOnly} onCheckedChange={setDifferencesOnly} />
          <Label htmlFor={filterId} className="font-normal">
            Show differences only
          </Label>
        </div>
      </div>

      <div className={cn("border-t border-border", classNames?.matrix)} role="table" aria-label="Studio and Workshop plan comparison">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] @max-[540px]:grid-cols-2" role="row">
          <div className="flex items-end px-8 pb-5 text-xs text-muted-foreground @max-[720px]:px-5 @max-[540px]:hidden" role="columnheader">
            What changes
          </div>
          {plans.map((plan) => (
            <div
              key={plan.id}
              role="columnheader"
              aria-label={`${plan.name} plan`}
              className={cn(
                "relative grid min-w-0 content-start border-l border-border p-5 @max-[720px]:p-3.5 @max-[540px]:border-l-0 @max-[540px]:first-of-type:border-l-0",
                plan.id === "workshop" && "@max-[540px]:border-l",
                selected === plan.id && "bg-muted",
              )}
            >
              <div>
                <h3 className="text-base font-medium">{plan.name}</h3>
                <span className="mt-0.5 block text-xs text-muted-foreground">{plan.detail}</span>
              </div>
              <div className="my-4" aria-live="polite" aria-atomic="true">
                <BillingPrice amount={pricing[plan.id][billing]} period="per seat / month" />
              </div>
              <Button
                type="button"
                variant={selected === plan.id ? "default" : "outline"}
                className="w-full"
                aria-pressed={selected === plan.id}
                onClick={() => setSelected((current) => (current === plan.id ? null : plan.id))}
              >
                {selected === plan.id ? "Selected" : `Select ${plan.name}`}
              </Button>
              {selected === plan.id ? (
                <motion.span
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  layoutId={`${id}-selected-rail`}
                  transition={reduce ? { duration: 0 } : motionPresets.spring.responsive}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="border-t border-border" role="rowgroup">
          <AnimatePresence initial={false}>
            {visibleFeatures.map((feature) => (
              <motion.div
                key={feature.label}
                role="row"
                className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden border-b border-border last:border-b-0 @max-[540px]:grid-cols-2"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={
                  reduce
                    ? undefined
                    : { height: 0, opacity: 0, transition: { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.fast } } }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter], delay: 0.04 } }
                }
              >
                <div className="flex min-h-11 min-w-0 items-center px-8 py-2.5 @max-[720px]:px-5 @max-[540px]:col-span-2 @max-[540px]:min-h-0 @max-[540px]:px-5 @max-[540px]:pt-2.5 @max-[540px]:pb-0 @max-[540px]:text-xs @max-[540px]:text-muted-foreground" role="rowheader">
                  {feature.label}
                </div>
                <div className={cn("flex min-h-11 min-w-0 items-center border-l border-border px-5 py-2.5 text-muted-foreground @max-[540px]:min-h-0 @max-[540px]:border-l-0 @max-[540px]:px-5 @max-[540px]:pt-1 @max-[540px]:pb-2.5", selected === "studio" && "bg-muted text-foreground")} role="cell">
                  <span className="sr-only">Studio</span>
                  <Value text={feature.studio} />
                </div>
                <div className={cn("flex min-h-11 min-w-0 items-center border-l border-border px-5 py-2.5 text-muted-foreground @max-[540px]:min-h-0 @max-[540px]:px-5 @max-[540px]:pt-1 @max-[540px]:pb-2.5", selected === "workshop" && "bg-muted text-foreground")} role="cell">
                  <span className="sr-only">Workshop</span>
                  <Value text={feature.workshop} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className={cn("flex min-h-12 flex-wrap items-center justify-between gap-3 border-t border-border px-8 py-3 text-xs text-muted-foreground @max-[720px]:flex-col @max-[720px]:items-start @max-[720px]:px-5", classNames?.footer)}>
        <span>Prices in USD per seat. Yearly plans are billed annually.</span>
        <p className="sr-only" role="status" aria-live="polite">
          {selected ? `${selected === "studio" ? "Studio" : "Workshop"} selected` : ""}
        </p>
      </div>
    </Card>
  )
}
