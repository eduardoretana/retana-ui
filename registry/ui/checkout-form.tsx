"use client"

import * as React from "react"
import { Banknote, CreditCard, Landmark, Store, Truck, Zap, type LucideIcon } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  checkoutFieldErrors,
  formatMoney,
  resolveCheckoutLabels,
  type CheckoutDraft,
  type CheckoutField,
  type CheckoutIcon,
  type CheckoutLabels,
  type CheckoutLayout,
  type CheckoutMethod,
} from "@/registry/retana/lib/checkout"
import { ActionButton } from "@/registry/retana/ui/action-button"
import { ActionFooter } from "@/registry/retana/ui/action-footer"
import { PhoneInput } from "@/registry/retana/ui/phone-input"
import { RadioCards } from "@/registry/retana/ui/radio-cards"
import { Stepper } from "@/registry/retana/ui/stepper"

const ICONS: Record<CheckoutIcon, LucideIcon> = {
  truck: Truck,
  fast: Zap,
  store: Store,
  card: CreditCard,
  bank: Landmark,
  cash: Banknote,
}

export type CheckoutFormProps = {
  layout: CheckoutLayout
  draft: CheckoutDraft
  onDraftChange: (patch: Partial<CheckoutDraft>) => void
  shippingMethods: readonly CheckoutMethod[]
  paymentMethods: readonly CheckoutMethod[]
  currency?: string
  locale?: string
  labels?: Partial<CheckoutLabels>
  couponError?: string | null
  appliedCoupon?: string | null
  onApplyCoupon?: (code: string) => void | Promise<void>
  onSubmit: (draft: CheckoutDraft) => Promise<void>
  onBackToStore?: () => void
  showStepper?: boolean
  disabled?: boolean
  busy?: boolean
  className?: string
}

function MethodIcon({ name }: { name: CheckoutIcon }) {
  const Icon = ICONS[name]
  return <Icon aria-hidden="true" />
}

function moneyOrFree(cents: number | undefined, locale: string, currency: string, free: string) {
  if (!cents) return free
  return formatMoney(cents, locale, currency)
}

export function CheckoutForm({
  layout,
  draft,
  onDraftChange,
  shippingMethods,
  paymentMethods,
  currency = "MXN",
  locale = "es-MX",
  labels,
  couponError,
  appliedCoupon,
  onApplyCoupon,
  onSubmit,
  onBackToStore,
  showStepper,
  disabled = false,
  busy = false,
  className,
}: CheckoutFormProps) {
  const copy = resolveCheckoutLabels(locale, labels)
  const baseId = React.useId()
  const alertId = `${baseId}-errors`
  const couponId = `${baseId}-coupon`
  const [errors, setErrors] = React.useState<Partial<Record<CheckoutField, string>>>({})
  const [open, setOpen] = React.useState<string[]>(["contact", "shipping", "payment", "coupon"])
  const focusErrors = React.useRef(false)
  const progress = layout !== "single" && (showStepper ?? true)
  const country = locale.toLowerCase().startsWith("es") ? "MX" : "US"
  const locked = disabled || busy

  const sections = React.useMemo(
    () => [
      { id: "contact", label: copy.stepContact },
      { id: "shipping", label: copy.stepShipping },
      { id: "payment", label: copy.stepPayment },
    ],
    [copy.stepContact, copy.stepPayment, copy.stepShipping],
  )

  const step = !draft.email.trim() ? 0 : !draft.shippingMethodId ? 1 : 2

  React.useEffect(() => {
    if (!focusErrors.current) return
    focusErrors.current = false
    document.getElementById(alertId)?.focus()
  }, [errors, alertId])

  async function submit() {
    const next = checkoutFieldErrors(draft, copy)
    setErrors(next)
    if (Object.keys(next).length) {
      focusErrors.current = true
      throw new Error("invalid")
    }
    await onSubmit(draft)
  }

  function patch(next: Partial<CheckoutDraft>) {
    onDraftChange(next)
  }

  function openSection(id: string) {
    setOpen((current) => (current.includes(id) ? current : [...current, id]))
    document.getElementById(`${baseId}-section-${id}`)?.focus()
  }

  const contact = (
    <div className="grid gap-3">
      <TextField
        id={`${baseId}-email`}
        label={copy.email}
        type="email"
        autoComplete="email"
        value={draft.email}
        error={errors.email}
        disabled={locked}
        onChange={(email) => patch({ email })}
      />
      <PhoneInput
        id={`${baseId}-phone`}
        label={copy.phone}
        value={draft.phone}
        defaultCountry={country}
        preferredCountries={["MX", "US"]}
        error={errors.phone}
        disabled={locked}
        required
        onValueChange={(phone) => patch({ phone })}
      />
    </div>
  )

  const address = (
    <fieldset className="grid gap-3" disabled={locked}>
      <legend className="sr-only">{copy.shippingTitle}</legend>
      <TextField id={`${baseId}-name`} label={copy.fullName} autoComplete="name" value={draft.name} error={errors.name} disabled={locked} onChange={(name) => patch({ name })} />
      <TextField id={`${baseId}-line1`} label={copy.line1} autoComplete="address-line1" value={draft.line1} error={errors.line1} disabled={locked} onChange={(line1) => patch({ line1 })} />
      <TextField id={`${baseId}-line2`} label={copy.line2} autoComplete="address-line2" value={draft.line2} disabled={locked} onChange={(line2) => patch({ line2 })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField id={`${baseId}-city`} label={copy.city} autoComplete="address-level2" value={draft.city} error={errors.city} disabled={locked} onChange={(city) => patch({ city })} />
        <TextField id={`${baseId}-region`} label={copy.region} autoComplete="address-level1" value={draft.region} error={errors.region} disabled={locked} onChange={(region) => patch({ region })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField id={`${baseId}-postal`} label={copy.postalCode} autoComplete="postal-code" value={draft.postalCode} error={errors.postalCode} disabled={locked} onChange={(postalCode) => patch({ postalCode })} />
        <TextField id={`${baseId}-country`} label={copy.country} autoComplete="country-name" value={draft.country} error={errors.country} disabled={locked} onChange={(countryName) => patch({ country: countryName })} />
      </div>
    </fieldset>
  )

  const shipping = (
    <div className="grid gap-3">
      {address}
      <RadioCards
        aria-label={copy.shippingTitle}
        layout="list"
        value={draft.shippingMethodId || null}
        disabled={locked}
        onValueChange={(shippingMethodId) => patch({ shippingMethodId })}
        options={shippingMethods.map((method) => ({
          value: method.id,
          label: method.label,
          description: method.description,
          meta: moneyOrFree(method.priceCents, locale, currency, copy.free),
          icon: <MethodIcon name={method.icon ?? "truck"} />,
        }))}
        classNames={{ card: "min-h-11" }}
      />
      {errors.shippingMethodId ? <p className="text-xs text-destructive">{errors.shippingMethodId}</p> : null}
    </div>
  )

  const payment = (
    <div className="grid gap-3">
      <RadioCards
        aria-label={copy.paymentTitle}
        layout="list"
        value={draft.paymentMethodId || null}
        disabled={locked}
        onValueChange={(paymentMethodId) => patch({ paymentMethodId })}
        options={paymentMethods.map((method) => ({
          value: method.id,
          label: method.label,
          description: method.description,
          icon: <MethodIcon name={method.icon ?? "card"} />,
        }))}
        classNames={{ card: "min-h-11" }}
      />
      {errors.paymentMethodId ? <p className="text-xs text-destructive">{errors.paymentMethodId}</p> : null}
    </div>
  )

  const coupon = (
    <div className="grid gap-2">
      <Label htmlFor={couponId}>{copy.coupon}</Label>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Input
          id={couponId}
          value={draft.couponCode}
          disabled={locked}
          autoComplete="off"
          aria-invalid={couponError ? true : undefined}
          aria-describedby={couponError ? `${couponId}-error` : appliedCoupon ? `${couponId}-applied` : undefined}
          onChange={(event) => patch({ couponCode: event.target.value })}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            event.preventDefault()
            event.stopPropagation()
            void onApplyCoupon?.(draft.couponCode)
          }}
          className="h-11 min-h-11 min-w-0 flex-1"
        />
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
          disabled={locked}
          onClick={() => void onApplyCoupon?.(draft.couponCode)}
        >
          {copy.applyCoupon}
        </button>
      </div>
      {couponError ? (
        <p id={`${couponId}-error`} role="alert" className="text-xs text-destructive">
          {couponError}
        </p>
      ) : null}
      {appliedCoupon && !couponError ? (
        <p id={`${couponId}-applied`} role="status" className="text-xs text-muted-foreground">
          {copy.couponApplied}: {appliedCoupon}
        </p>
      ) : null}
    </div>
  )

  const blocks = [
    { id: "contact", title: copy.contactTitle, body: contact },
    { id: "shipping", title: copy.shippingTitle, body: shipping },
    { id: "payment", title: copy.paymentTitle, body: payment },
    { id: "coupon", title: copy.couponTitle, body: coupon },
  ]

  return (
    <form
      data-slot="checkout-form"
      data-layout={layout}
      aria-busy={busy ? true : undefined}
      className={cn("grid min-w-0 gap-4", className)}
      onSubmit={(event) => {
        event.preventDefault()
        void submit().catch(() => undefined)
      }}
    >
      {progress ? (
        <Stepper
          steps={sections}
          current={step}
          label={copy.stepsLabel}
          completeLabel={copy.stepsComplete}
          onStepSelect={(index) => {
            const id = sections[index]?.id
            if (id) openSection(id)
          }}
        />
      ) : null}

      {Object.keys(errors).length ? (
        <div id={alertId} role="alert" tabIndex={-1} className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive outline-none">
          <ul className="grid gap-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {layout === "accordion" ? (
        <Accordion type="multiple" value={open} onValueChange={setOpen}>
          {blocks.map((block) => (
            <AccordionItem key={block.id} value={block.id}>
              <AccordionTrigger id={`${baseId}-section-${block.id}`}>{block.title}</AccordionTrigger>
              <AccordionContent>{block.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        blocks.map((block) => (
          <section key={block.id} aria-labelledby={`${baseId}-section-${block.id}`} className="grid min-w-0 gap-3">
            <h2 id={`${baseId}-section-${block.id}`} tabIndex={-1} className="text-base font-medium outline-none">
              {block.title}
            </h2>
            {block.body}
          </section>
        ))
      )}

      <ActionFooter
        hint={copy.orderHint}
        secondary={onBackToStore ? { label: copy.backToStore, onSelect: onBackToStore } : undefined}
        disabled={locked}
      />
      <ActionButton
        label={copy.placeOrder}
        pendingLabel={copy.placingOrder}
        successLabel={copy.orderPlaced}
        disabled={locked}
        className="min-h-11 w-full"
        onAction={submit}
      />
    </form>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  type = "text",
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  type?: string
  autoComplete?: string
}) {
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-h-11 min-w-0"
      />
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
