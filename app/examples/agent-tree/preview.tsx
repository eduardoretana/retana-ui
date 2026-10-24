"use client"

import { AgentTree } from "@/registry/ui/agent-tree"

import { previewNodes } from "./fixtures"

export default function Preview() {
  return (
    <div className="bg-background p-3">
      <AgentTree nodes={previewNodes} />
    </div>
  )
}
