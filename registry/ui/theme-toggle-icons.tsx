"use client"

/**
 * Fourteen animated theme icons ported from theme-toggles (MIT).
 * Copyright (c) Alfie Jones. https://github.com/AlfieJones/theme-toggles
 * The upstream repository has no LICENSE file. MIT is declared in the README
 * and in @theme-toggles/react@5.0.5. See NOTICE.
 */

import type { ComponentProps } from "react"

import { Around } from "@/registry/retana/ui/theme-toggles/around"
import { Classic } from "@/registry/retana/ui/theme-toggles/classic"
import { DarkInner } from "@/registry/retana/ui/theme-toggles/dark-inner"
import { DarkSide } from "@/registry/retana/ui/theme-toggles/dark-side"
import { Eclipse } from "@/registry/retana/ui/theme-toggles/eclipse"
import { Expand } from "@/registry/retana/ui/theme-toggles/expand"
import { HalfSun } from "@/registry/retana/ui/theme-toggles/half-sun"
import { Horizon } from "@/registry/retana/ui/theme-toggles/horizon"
import { InnerMoon } from "@/registry/retana/ui/theme-toggles/inner-moon"
import { LightSwitch } from "@/registry/retana/ui/theme-toggles/light-switch"
import { Lightbulb } from "@/registry/retana/ui/theme-toggles/lightbulb"
import { Simple } from "@/registry/retana/ui/theme-toggles/simple"
import { Spin } from "@/registry/retana/ui/theme-toggles/spin"
import { Within } from "@/registry/retana/ui/theme-toggles/within"

export {
  Around,
  Classic,
  DarkInner,
  DarkSide,
  Eclipse,
  Expand,
  HalfSun,
  Horizon,
  InnerMoon,
  LightSwitch,
  Lightbulb,
  Simple,
  Spin,
  Within,
}

export const themeToggleIcons = {
  around: Around,
  classic: Classic,
  "dark-inner": DarkInner,
  "dark-side": DarkSide,
  eclipse: Eclipse,
  expand: Expand,
  "half-sun": HalfSun,
  horizon: Horizon,
  "inner-moon": InnerMoon,
  "light-switch": LightSwitch,
  lightbulb: Lightbulb,
  simple: Simple,
  spin: Spin,
  within: Within,
} as const

export type ThemeToggleIconName = keyof typeof themeToggleIcons

export const themeToggleIconNames = Object.keys(themeToggleIcons) as ThemeToggleIconName[]

export function ThemeToggleIcon({
  name,
  ...props
}: { name: ThemeToggleIconName } & ComponentProps<typeof Classic>) {
  const Icon = themeToggleIcons[name]
  return <Icon {...props} />
}
