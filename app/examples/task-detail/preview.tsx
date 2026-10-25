"use client"

import { TaskDetailDemo } from "./demo"

export default function Preview() {
  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="origin-top-left scale-[0.55]">
        <TaskDetailDemo />
      </div>
    </div>
  )
}
