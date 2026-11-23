import type { ColorFormat, HsvaColor } from "@/registry/ui/color-picker"

export type PickerFixture = {
  /** Color the scene starts on. */
  color: HsvaColor
  /** Saved colors. null while the host is still loading them. */
  saved: HsvaColor[] | null
  format: ColorFormat
  maxSwatches: number
}

/** Glazes from Taller Ladrillo, an invented pottery workshop in Guanajuato. HSV, no fixed CSS colors. */
const barro: HsvaColor = { h: 17, s: 0.77, v: 0.71, a: 1 }
const jade: HsvaColor = { h: 168, s: 0.58, v: 0.44, a: 1 }
const ocre: HsvaColor = { h: 38, s: 0.49, v: 0.85, a: 1 }
const cobalto: HsvaColor = { h: 222, s: 0.72, v: 0.62, a: 1 }
const crema: HsvaColor = { h: 42, s: 0.16, v: 0.96, a: 1 }
const humo: HsvaColor = { h: 210, s: 0.08, v: 0.42, a: 0.6 }

export const glazes: HsvaColor[] = [barro, jade, ocre, cobalto, crema]

/** Five saved glazes, picking the clay red. */
export const filled: PickerFixture = {
  color: barro,
  saved: glazes,
  format: "hex",
  maxSwatches: 12,
}

/** Nothing saved yet. The save button is the first action. */
export const empty: PickerFixture = {
  ...filled,
  color: cobalto,
  saved: [],
}

/** The host is still reading the saved colors. */
export const loading: PickerFixture = {
  ...filled,
  saved: null,
}

/** What the retry would have shown. The scene starts before this data arrives. */
export const error: PickerFixture = filled

/** Someone pasted a channel out of range into the RGB field. Nothing is applied. */
export const invalid: PickerFixture = {
  ...filled,
  format: "rgb",
}

export const invalidPaste = "rgb(300 12 40)"

/** A browser without the EyeDropper API (Firefox, Safari, most phones). */
export const noEyedropper: PickerFixture = {
  ...filled,
  color: jade,
}

/** Twelve of twelve saved. Save stays visible, disabled, with the reason. */
export const full: PickerFixture = {
  ...filled,
  color: humo,
  format: "hsl",
  saved: [
    ...glazes,
    { h: 0, s: 0.62, v: 0.66, a: 1 },
    { h: 95, s: 0.35, v: 0.55, a: 1 },
    { h: 280, s: 0.3, v: 0.5, a: 1 },
    { h: 196, s: 0.45, v: 0.8, a: 1 },
    { h: 25, s: 0.3, v: 0.35, a: 1 },
    { h: 52, s: 0.7, v: 0.9, a: 1 },
    humo,
  ],
}

/** Popover mode. Same data as filled, behind a trigger. */
export const popover: PickerFixture = {
  ...filled,
  color: ocre,
}
