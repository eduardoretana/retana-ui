"use client"

import { aeDays, aeAppointments } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { DayScrollerSchedule } from "@/registry/blocks/ae/day-scroller-schedule"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <DayScrollerSchedule days={aeDays} items={aeAppointments} defaultDay="2026-10-22" />
      </AeStagger>
    </div>
  )
}
