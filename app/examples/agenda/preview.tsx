"use client"

import { AgendaDemo } from "./demo"

export default function Preview() {
  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="h-[760px] w-[1280px] origin-top-left scale-[0.34]">
        <AgendaDemo chrome={false} />
      </div>
    </div>
  )
}
