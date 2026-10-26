import type { ComponentType, ReactNode } from "react"

export type SceneLocale = "es" | "en"

export type SceneLog = (line: string) => void

export type SceneRenderProps = {
  locale: SceneLocale
  log: SceneLog
}

export type SceneSize = "sm" | "md" | "lg" | "desk"

export type SceneSurface = "card" | "canvas" | "app"

export type ScenePadding = "none" | "sm" | "md" | "lg"

export type SceneFrame = {
  size: SceneSize
  surface: SceneSurface
  padding: ScenePadding
}

export type Scene = {
  id: string
  label: string
  labelEn: string
  render: ComponentType<SceneRenderProps>
  frame: SceneFrame
}

export const sceneSizeClass: Record<SceneSize, string> = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-2xl",
  desk: "w-full max-w-6xl",
}

/** Layout width of the thumbnail before it is scaled into the catalog card. */
export const sceneSizePx: Record<SceneSize, number> = {
  sm: 320,
  md: 440,
  lg: 640,
  desk: 960,
}

export const scenePaddingClass: Record<ScenePadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
}

export const sceneSurfaceClass: Record<SceneSurface, string> = {
  card: "bg-card",
  canvas: "bg-muted/40",
  app: "bg-background",
}

export function sceneText(locale: SceneLocale, es: string, en: string) {
  return locale === "en" ? en : es
}

export function formatSceneArg(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "number" || typeof value === "boolean" || value == null) return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/** `onApprove("camila")` — the line sonner shows when a piece fires a callback. */
export function formatSceneCall(name: string, args: readonly unknown[] = []) {
  return `${name}(${args.map(formatSceneArg).join(", ")})`
}

export type SceneFrameProps = {
  frame: SceneFrame
  children: ReactNode
  className?: string
}
