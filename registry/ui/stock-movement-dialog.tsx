"use client"

/**
 * Adjustment and transfer dialog. Clean-room: one form, two modes.
 * Quantity uses number-field. Validation comes from the stock ledger core.
 * RUI-QTY-001 is applied as a draft rule.
 */

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  balanceAccessibleName,
  balanceKey,
  formatBalance,
  toTransferPair,
  validateMovement,
  type MovementIssue,
  type StockMovement,
  type StockMovementDraft,
} from "@/registry/retana/lib/stock-ledger"
import { NumberField } from "@/registry/retana/ui/number-field"

export type StockMovementDialogLabels = {
  adjustTitle: string
  transferTitle: string
  description: string
  sku: string
  warehouse: string
  origin: string
  destination: string
  quantity: string
  reason: string
  note: string
  before: string
  after: string
  summary: string
  cancel: string
  submitAdjust: string
  submitTransfer: string
  submitting: string
  close: string
  submitError: string
  negative: string
  unit: string
  issue: Record<MovementIssue["code"], string>
}

export function stockMovementDialogLabels(locale: string): StockMovementDialogLabels {
  if (locale.toLowerCase().startsWith("en")) {
    return {
      adjustTitle: "Record adjustment",
      transferTitle: "Record transfer",
      description: "The balance is calculated before anything is saved.",
      sku: "SKU",
      warehouse: "Warehouse",
      origin: "Origin warehouse",
      destination: "Destination warehouse",
      quantity: "Quantity",
      reason: "Reason",
      note: "Note",
      before: "Balance before",
      after: "Balance after",
      summary: "Summary",
      cancel: "Cancel",
      submitAdjust: "Save adjustment",
      submitTransfer: "Save transfer",
      submitting: "Saving",
      close: "Close",
      submitError: "Could not save. Check the values and try again.",
      negative: "Negative balance",
      unit: "units",
      issue: {
        required: "This field is required.",
        qty_zero: "Quantity cannot be zero.",
        qty_not_integer: "Use a whole number.",
        qty_sign: "Quantity has to be positive.",
        insufficient: "Not enough stock.",
        reason_required: "An adjustment needs a reason.",
        same_warehouse: "Origin and destination have to be different.",
      },
    }
  }
  return {
    adjustTitle: "Registrar ajuste",
    transferTitle: "Registrar transferencia",
    description: "El saldo se calcula antes de guardar.",
    sku: "SKU",
    warehouse: "Almacén",
    origin: "Almacén de origen",
    destination: "Almacén de destino",
    quantity: "Cantidad",
    reason: "Motivo",
    note: "Nota",
    before: "Saldo anterior",
    after: "Saldo posterior",
    summary: "Resumen",
    cancel: "Cancelar",
    submitAdjust: "Guardar ajuste",
    submitTransfer: "Guardar transferencia",
    submitting: "Guardando",
    close: "Cerrar",
    submitError: "No se pudo guardar. Revisa los datos e inténtalo de nuevo.",
    negative: "Saldo negativo",
    unit: "unidades",
    issue: {
      required: "Este campo es obligatorio.",
      qty_zero: "La cantidad no puede ser cero.",
      qty_not_integer: "Usa un número entero.",
      qty_sign: "La cantidad tiene que ser positiva.",
      insufficient: "No hay suficiente existencia.",
      reason_required: "El ajuste necesita un motivo.",
      same_warehouse: "El origen y el destino tienen que ser distintos.",
    },
  }
}

export type StockMovementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "adjust" | "transfer"
  skus: readonly { id: string; label: string }[]
  warehouses: readonly { id: string; label: string }[]
  balances: ReadonlyMap<string, number>
  defaultValues?: Partial<StockMovementDraft>
  reasons: readonly { id: string; label: string }[]
  onSubmit: (movements: StockMovement[]) => Promise<void>
  labels?: Partial<Omit<StockMovementDialogLabels, "issue">> & { issue?: Partial<StockMovementDialogLabels["issue"]> }
  locale?: string
  unit?: string
  /** Shown before the operator submits. */
  issues?: readonly MovementIssue[]
  /** Host-owned in-flight state. */
  busy?: boolean
  /** Host-owned save error. The captured values stay. */
  externalError?: string
  className?: string
}

function createId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${random}`
}

function messageFor(issues: readonly MovementIssue[], field: MovementIssue["field"], labels: StockMovementDialogLabels) {
  const issue = issues.find((item) => item.field === field)
  return issue ? labels.issue[issue.code] : ""
}

export function StockMovementDialog({
  open,
  onOpenChange,
  mode,
  skus,
  warehouses,
  balances,
  defaultValues,
  reasons,
  onSubmit,
  labels: labelOverrides,
  locale = "es-MX",
  unit,
  issues,
  busy = false,
  externalError,
  className,
}: StockMovementDialogProps) {
  const base = stockMovementDialogLabels(locale)
  const labels: StockMovementDialogLabels = {
    ...base,
    ...labelOverrides,
    issue: { ...base.issue, ...labelOverrides?.issue },
  }
  const unitLabel = unit ?? labels.unit
  const reduced = useReducedMotion() === true
  const title = mode === "transfer" ? labels.transferTitle : labels.adjustTitle
  const qtyId = React.useId()
  const skuId = React.useId()
  const warehouseIdField = React.useId()
  const destinationId = React.useId()
  const reasonFieldId = React.useId()
  const noteId = React.useId()
  const [sku, setSku] = React.useState(defaultValues?.sku ?? "")
  const [warehouseId, setWarehouseId] = React.useState(defaultValues?.warehouseId ?? "")
  const [destinationIdValue, setDestinationIdValue] = React.useState(defaultValues?.destinationWarehouseId ?? "")
  const [qty, setQty] = React.useState(defaultValues?.qty ?? 0)
  const [reasonId, setReasonId] = React.useState(defaultValues?.reason ?? "")
  const [note, setNote] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  const [clientIssues, setClientIssues] = React.useState<MovementIssue[]>([])
  const [submitError, setSubmitError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const returnFocus = React.useRef<HTMLElement | null>(null)

  function applyDefaults() {
    setSku(defaultValues?.sku ?? "")
    setWarehouseId(defaultValues?.warehouseId ?? "")
    setDestinationIdValue(defaultValues?.destinationWarehouseId ?? "")
    setQty(defaultValues?.qty ?? 0)
    setReasonId(defaultValues?.reason ?? "")
    setNote("")
    setSubmitted(false)
    setClientIssues([])
    setSubmitError("")
  }

  const reason = reasons.find((item) => item.id === reasonId)
  const reasonText = [reason?.label || reasonId.trim(), note.trim()].filter(Boolean).join(". ")
  const draft: StockMovementDraft = {
    sku,
    warehouseId,
    kind: mode === "transfer" ? "transfer" : "adjust",
    qty,
    ...(mode === "transfer" ? { destinationWarehouseId: destinationIdValue } : {}),
    ...(reasonText ? { reason: reasonText } : {}),
  }
  const visibleIssues = submitted ? clientIssues : [...(issues ?? [])]
  const pending = busy || submitting
  const errorText = submitError || externalError || ""
  const originBefore = balances.get(balanceKey(sku, warehouseId)) ?? 0
  const originDelta = mode === "transfer" ? -Math.abs(qty) : qty
  const originAfter = originBefore + originDelta
  const destinationBefore = balances.get(balanceKey(sku, destinationIdValue)) ?? 0
  const destinationAfter = destinationBefore + Math.abs(qty)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (pending) return
    const found = validateMovement(draft, balances)
    setSubmitted(true)
    setClientIssues(found)
    if (found.length > 0) {
      const fieldId: Record<MovementIssue["field"], string> = {
        sku: skuId,
        warehouseId: warehouseIdField,
        destinationWarehouseId: destinationId,
        qty: qtyId,
        reason: reasonFieldId,
      }
      document.getElementById(fieldId[found[0]?.field ?? "qty"])?.focus()
      return
    }
    setSubmitError("")
    setSubmitting(true)
    try {
      const at = new Date().toISOString()
      const movements = mode === "transfer"
        ? toTransferPair({
            sku: sku.trim(),
            fromWarehouseId: warehouseId,
            toWarehouseId: destinationIdValue,
            qty,
            at,
            transferId: createId("tr"),
            ...(reasonText ? { reason: reasonText } : {}),
          })
        : [{
            id: createId("mov"),
            at,
            sku: sku.trim(),
            warehouseId,
            kind: "adjust" as const,
            qty,
            ...(reasonText ? { reason: reasonText } : {}),
          }]
      await onSubmit(movements)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : labels.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  function fieldError(field: MovementIssue["field"], id: string) {
    const text = messageFor(visibleIssues, field, labels)
    if (!text) return null
    return <p id={id} role="alert" className="text-sm text-destructive">{text}</p>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-busy={pending || undefined}
        onOpenAutoFocus={() => {
          applyDefaults()
          const current = document.activeElement
          if (current instanceof HTMLElement) returnFocus.current = current
        }}
        onCloseAutoFocus={(event) => {
          const opener = returnFocus.current
          returnFocus.current = null
          if (!opener) return
          event.preventDefault()
          opener.focus()
        }}
        className={cn(
          "flex h-dvh max-h-dvh w-full max-w-none flex-col gap-4 overflow-y-auto rounded-none p-4 top-0 left-0 translate-none sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[min(40rem,calc(100dvh-2rem))] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl motion-reduce:animate-none motion-reduce:duration-0",
          reduced && "animate-none duration-0",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          variant="ghost"
          className="absolute top-3 right-3 h-11 min-h-11 w-11"
          onClick={() => onOpenChange(false)}
        >
          <span className="sr-only">{labels.close}</span>
          <span aria-hidden="true">×</span>
        </Button>
        <form className="flex flex-col gap-4" onSubmit={(event) => void submit(event)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor={skuId}>{labels.sku}</Label>
            <Select value={sku || undefined} onValueChange={setSku}>
              <SelectTrigger id={skuId} aria-invalid={Boolean(messageFor(visibleIssues, "sku", labels)) || undefined} className="h-11 w-full min-h-11">
                <SelectValue placeholder={labels.sku} />
              </SelectTrigger>
              <SelectContent>
                {skus.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("sku", `${skuId}-error`)}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={warehouseIdField}>{mode === "transfer" ? labels.origin : labels.warehouse}</Label>
            <Select value={warehouseId || undefined} onValueChange={setWarehouseId}>
              <SelectTrigger id={warehouseIdField} aria-invalid={Boolean(messageFor(visibleIssues, "warehouseId", labels)) || undefined} className="h-11 w-full min-h-11">
                <SelectValue placeholder={labels.warehouse} />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("warehouseId", `${warehouseIdField}-error`)}
          </div>
          {mode === "transfer" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={destinationId}>{labels.destination}</Label>
              <Select value={destinationIdValue || undefined} onValueChange={setDestinationIdValue}>
                <SelectTrigger id={destinationId} aria-invalid={Boolean(messageFor(visibleIssues, "destinationWarehouseId", labels)) || undefined} className="h-11 w-full min-h-11">
                  <SelectValue placeholder={labels.destination} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("destinationWarehouseId", `${destinationId}-error`)}
            </div>
          ) : null}
          <div aria-describedby={messageFor(visibleIssues, "qty", labels) ? `${qtyId}-error` : undefined}>
            <NumberField
              id={qtyId}
              label={labels.quantity}
              value={qty}
              onValueChange={setQty}
              min={mode === "transfer" ? 0 : -9_999_999}
              max={9_999_999}
              step={1}
              locale={locale}
              formatOptions={{ maximumFractionDigits: 0 }}
              size="lg"
            />
            {fieldError("qty", `${qtyId}-error`)}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={reasonFieldId}>{labels.reason}</Label>
            <Select value={reasonId || undefined} onValueChange={setReasonId}>
              <SelectTrigger id={reasonFieldId} aria-invalid={Boolean(messageFor(visibleIssues, "reason", labels)) || undefined} className="h-11 w-full min-h-11">
                <SelectValue placeholder={labels.reason} />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("reason", `${reasonFieldId}-error`)}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={noteId}>{labels.note}</Label>
            <Textarea id={noteId} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24" />
          </div>
          <section className="rounded-xl bg-muted p-3" aria-label={labels.summary}>
            <h3 className="text-sm font-medium">{labels.summary}</h3>
            <BalancePair
              beforeLabel={labels.before}
              afterLabel={labels.after}
              place={mode === "transfer" ? labels.origin : labels.warehouse}
              before={originBefore}
              after={originAfter}
              locale={locale}
              unit={unitLabel}
              negative={labels.negative}
            />
            {mode === "transfer" ? (
              <BalancePair
                beforeLabel={labels.before}
                afterLabel={labels.after}
                place={labels.destination}
                before={destinationBefore}
                after={destinationAfter}
                locale={locale}
                unit={unitLabel}
                negative={labels.negative}
              />
            ) : null}
          </section>
          {errorText ? <p role="alert" className="text-sm text-destructive">{errorText}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="h-11 min-h-11" onClick={() => onOpenChange(false)} disabled={pending}>
              {labels.cancel}
            </Button>
            <Button type="submit" className="h-11 min-h-11" disabled={pending}>
              {pending ? labels.submitting : mode === "transfer" ? labels.submitTransfer : labels.submitAdjust}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function BalancePair({
  place,
  beforeLabel,
  afterLabel,
  before,
  after,
  locale,
  unit,
  negative,
}: {
  place: string
  beforeLabel: string
  afterLabel: string
  before: number
  after: number
  locale: string
  unit: string
  negative: string
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <p className="text-sm text-muted-foreground">{place}</p>
      <span />
      <BalanceValue label={beforeLabel} value={before} locale={locale} unit={unit} negative={negative} />
      <BalanceValue label={afterLabel} value={after} locale={locale} unit={unit} negative={negative} />
    </div>
  )
}

function BalanceValue({
  label,
  value,
  locale,
  unit,
  negative,
}: {
  label: string
  value: number
  locale: string
  unit: string
  negative: string
}) {
  const name = value < 0 ? `${balanceAccessibleName(value, unit, locale)}, ${negative}` : balanceAccessibleName(value, unit, locale)
  return (
    <p className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span aria-label={name} style={{ fontVariantNumeric: "tabular-nums", textAlign: "end" }} className={cn("tabular-nums text-end", value < 0 && "text-destructive")}>
        <span className="sr-only">{name}</span>
        <span aria-hidden="true">{formatBalance(value, locale)}</span>
      </span>
      {value < 0 ? <span className="text-xs text-destructive">{negative}</span> : null}
    </p>
  )
}
