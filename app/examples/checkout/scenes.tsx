"use client"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { CheckoutPage } from "@/registry/blocks/checkout-page"

import {
  accordion,
  couponApplied,
  couponInvalid,
  coupons,
  empty,
  error as broken,
  filled,
  labelsFor,
  linesFor,
  loading,
  paymentFor,
  shippingFor,
  submitting,
  success,
  twoColumn,
  type CheckoutFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "md", surface: "card", padding: "md" }
const wide: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }

function CheckoutScene({ locale, log, fixture }: SceneRenderProps & { fixture: CheckoutFixture }) {
  const moneyLocale = locale === "en" ? "en" : "es-MX"
  return (
    <CheckoutPage
      lines={fixture.lines === "none" ? [] : linesFor(locale)}
      layout={fixture.layout ?? "single"}
      status={fixture.status}
      locale={moneyLocale}
      currency={locale === "en" ? "USD" : "MXN"}
      labels={labelsFor(locale)}
      shippingMethods={shippingFor(locale)}
      paymentMethods={paymentFor(locale)}
      coupons={coupons}
      defaultValues={fixture.draft}
      presetCoupon={fixture.preset}
      onQtyChange={(id, qty) => log(formatSceneCall("onQtyChange", [id, qty]))}
      onRemove={(id) => log(formatSceneCall("onRemove", [id]))}
      onApplyCoupon={(code) => log(formatSceneCall("onApplyCoupon", [code]))}
      onPlaceOrder={async (order) => {
        log(formatSceneCall("onPlaceOrder", [order.draft.email, order.totals.total]))
      }}
      onRetry={() => log(formatSceneCall("onRetry"))}
      onBackToStore={() => log(formatSceneCall("onBackToStore"))}
    />
  )
}

function scene(fixture: CheckoutFixture) {
  return function Render(props: SceneRenderProps) {
    return <CheckoutScene {...props} fixture={fixture} />
  }
}

export const scenes: Scene[] = [
  { id: "filled", label: "Lleno", labelEn: "Filled", render: scene(filled), frame },
  { id: "empty", label: "Vacío", labelEn: "Empty", render: scene(empty), frame },
  { id: "loading", label: "Cargando", labelEn: "Loading", render: scene(loading), frame },
  { id: "error", label: "Error", labelEn: "Error", render: scene(broken), frame },
  { id: "coupon-invalid", label: "Cupón inválido", labelEn: "Invalid coupon", render: scene(couponInvalid), frame },
  { id: "coupon-applied", label: "Cupón aplicado", labelEn: "Coupon applied", render: scene(couponApplied), frame },
  { id: "submitting", label: "Enviando", labelEn: "Submitting", render: scene(submitting), frame },
  { id: "success", label: "Confirmado", labelEn: "Placed", render: scene(success), frame },
  { id: "two-column", label: "Dos columnas", labelEn: "Two columns", render: scene(twoColumn), frame: wide },
  { id: "accordion", label: "Acordeón", labelEn: "Accordion", render: scene(accordion), frame },
]
