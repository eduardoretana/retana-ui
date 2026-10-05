"use client"

import { GaugeComposition, gaugeTemplates, templatePreview } from "@/registry/ui/gauge-kit"

const ids = ["speedometer", "clock", "compass", "activity-ring"]

export default function Preview() {
  const templates = gaugeTemplates.filter((template) => ids.includes(template.id))
  return (
    <div className="grid h-full grid-cols-2 gap-2 bg-background p-3">
      {templates.map((template) => {
        const { spec, value } = templatePreview(template)
        return (
          <div key={template.id} className="min-w-0">
            <GaugeComposition spec={spec} value={value} label={template.name} />
          </div>
        )
      })}
    </div>
  )
}
