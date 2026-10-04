"use client"

import { useState } from "react"

import { BugReportForm, type BugReport } from "@/registry/ui/bug-report-form"

export function Demo() {
  const [fail, setFail] = useState(false)
  const [sent, setSent] = useState<BugReport | null>(null)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={fail}
          onChange={(event) => setFail(event.target.checked)}
          className="size-4 accent-current"
        />
        Fail the next submit
      </label>
      <BugReportForm
        onSubmit={async (report) => {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          if (fail) throw new Error("The report could not be saved.")
          setSent(report)
        }}
      />
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Received <span className="text-foreground">{sent.title}</span>
          {sent.files.length ? ` with ${sent.files.length} file` : ""}.
        </p>
      ) : null}
    </div>
  )
}
