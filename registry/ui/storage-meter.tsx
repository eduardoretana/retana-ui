"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/local-first/storage-meter/storage-meter.tsx

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatBytes, useStorageQuota } from "@/registry/retana/hooks/use-device-capabilities"

export type StorageMeterProps = {
  warnThreshold?: number
  locale?: string
  className?: string
  classNames?: { root?: string; bar?: string }
}

export function StorageMeter({ warnThreshold = 0.8, locale = "en", className, classNames }: StorageMeterProps) {
  const { quota, loading, requestPersist } = useStorageQuota()
  if (loading && !quota) return <p className={cn("text-sm text-muted-foreground", className)}>Checking storage…</p>
  if (!quota || quota.quotaBytes <= 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Storage estimate unavailable</p>
  }
  const ratio = quota.quotaBytes > 0 ? quota.usedBytes / quota.quotaBytes : 0
  const percent = Math.round(ratio * 100)
  const tone = ratio > 0.95 ? "bg-destructive" : ratio >= warnThreshold ? "bg-accent" : "bg-primary"
  const text = `${formatBytes(quota.usedBytes, locale)} of ${formatBytes(quota.quotaBytes, locale)} used (${percent}%)`
  return (
    <div className={cn("flex flex-col gap-2", className, classNames?.root)}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={quota.quotaBytes}
        aria-valuenow={quota.usedBytes}
        aria-valuetext={text}
        className={cn("h-2 overflow-hidden rounded-full bg-muted", classNames?.bar)}
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-foreground">{text}</p>
        {quota.isPersisted ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Persistent</span>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => void requestPersist()}>
            Make persistent
          </Button>
        )}
      </div>
      {!quota.isPersisted ? <p className="text-xs text-muted-foreground">Best-effort</p> : null}
    </div>
  )
}
