"use client"

import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { HapticsToggle } from "@/registry/ui/haptics"
import { UiSoundsToggle } from "@/registry/ui/ui-sounds"
import { useFeedback, type FeedbackIntent } from "@/registry/hooks/use-feedback"

const intents: FeedbackIntent[] = ["tap", "success", "warning", "error", "ready", "attention"]

export function Demo() {
  const feedback = useFeedback()
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-2">
        <UiSoundsToggle />
        <HapticsToggle />
      </div>
      <div className="flex flex-wrap gap-2">
        {intents.map((intent) => (
          <motion.div key={intent} animate={feedback.motion(intent)}>
            <Button type="button" variant="outline" onClick={() => feedback.trigger(intent)}>
              {intent}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
