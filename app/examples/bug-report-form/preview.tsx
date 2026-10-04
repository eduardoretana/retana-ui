"use client"

import { BugReportForm } from "@/registry/ui/bug-report-form"

export default function BugReportFormPreview() {
  return (
    <div className="flex h-full items-start justify-center overflow-hidden bg-muted/30 p-3">
      <div className="w-full max-w-sm origin-top scale-[0.72]">
        <BugReportForm
          defaultValues={{ type: "ui", priority: "high", title: "Save covers the label" }}
          onSubmit={async () => {
            await new Promise((resolve) => setTimeout(resolve, 1200))
          }}
        />
      </div>
    </div>
  )
}
