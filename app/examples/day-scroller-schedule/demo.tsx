"use client"

import { aeDays, aeAppointments } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { DayScrollerSchedule } from "@/registry/blocks/ae/day-scroller-schedule"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <DayScrollerSchedule days={aeDays} items={aeAppointments} defaultDay="2026-10-22" />
      </AeStagger>
    </div>
  )
}
