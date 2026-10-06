"use client"

import { motion } from "motion/react"

import { MotionPreferenceControl, useMotionPreference } from "@/registry/ui/motion-preference"

export function Demo() {
  const reduced = useMotionPreference()
  return (
    <div className="flex flex-col items-start gap-4">
      <MotionPreferenceControl />
      <motion.div
        className="size-12 rounded-lg bg-primary"
        animate={reduced ? { x: 0 } : { x: [0, 48, 0] }}
        transition={reduced ? { duration: 0 } : { duration: 1.2, repeat: Infinity }}
      />
      <p className="text-sm text-muted-foreground">{reduced ? "El movimiento está reducido." : "El bloque se mueve."}</p>
    </div>
  )
}
