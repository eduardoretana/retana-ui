import type { CheckItem, ChecksPanelProps } from "@/registry/ui/checks-panel"
import { checksPanelLabels, checksPanelLabelsEs } from "@/registry/ui/checks-panel"

export type ChecksFixture = {
  props: Omit<ChecksPanelProps, "labels" | "variant">
}

const running: CheckItem[] = [
  { id: "lint", name: "lint", status: "passed", durationMs: 11_000, progress: 1 },
  { id: "typecheck", name: "typecheck", status: "passed", durationMs: 19_000, progress: 1 },
  { id: "unit", name: "unit", status: "running", durationMs: 8_000, progress: 0.4, estimated: true },
  { id: "preview", name: "preview", status: "queued", progress: 0 },
  { id: "e2e", name: "e2e", status: "queued", progress: 0 },
]

export const filled: ChecksFixture = {
  props: {
    passed: 2,
    total: 5,
    sha: "b7e21aa",
    message: "Guardar el folio del horno",
    checks: running,
    defaultOpen: false,
  },
}

export const empty: ChecksFixture = {
  props: { passed: 0, total: 0, sha: "0000000", message: "Sin comprobaciones", checks: [], defaultOpen: true },
}

export const loading: ChecksFixture = {
  props: {
    passed: 0,
    total: 5,
    sha: "b7e21aa",
    message: "Guardar el folio del horno",
    defaultOpen: true,
    checks: running.map((check) => ({ ...check, status: "queued" as const, progress: 0, durationMs: undefined, estimated: false })),
  },
}

export const error: ChecksFixture = {
  props: {
    passed: 4,
    total: 5,
    sha: "b7e21aa",
    message: "Guardar el folio del horno",
    defaultOpen: true,
    checks: [
      { id: "lint", name: "lint", status: "passed", durationMs: 11_000, progress: 1 },
      { id: "typecheck", name: "typecheck", status: "passed", durationMs: 19_000, progress: 1 },
      { id: "unit", name: "unit", status: "passed", durationMs: 33_000, progress: 1 },
      { id: "preview", name: "preview", status: "passed", durationMs: 38_000, progress: 1 },
      { id: "e2e", name: "e2e", status: "failed", durationMs: 29_000, progress: 1 },
    ],
  },
}

export const open: ChecksFixture = {
  props: { ...filled.props, defaultOpen: true },
}

export { checksPanelLabels, checksPanelLabelsEs }
