import type { ReactNode } from "react"

/** 320px frame, an empty state, a long unbreakable string, and an optional crowd of ten. */
export function StressCases({
  empty,
  long,
  crowded,
}: {
  empty: ReactNode
  long: ReactNode
  crowded?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-80 max-w-full rounded-lg border border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">320px · long value</p>
        {long}
      </div>
      <div className="w-80 max-w-full rounded-lg border border-dashed border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">Empty</p>
        {empty}
      </div>
      {crowded ? (
        <div className="w-80 max-w-full rounded-lg border border-border p-3">
          <p className="mb-2 text-xs text-muted-foreground">Ten</p>
          {crowded}
        </div>
      ) : null}
    </div>
  )
}
