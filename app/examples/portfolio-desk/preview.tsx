"use client"

import { PortfolioDeskDemo } from "./demo"

export default function Preview() {
  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="h-[1100px] w-[1280px] origin-top-left scale-[0.28] p-4">
        <PortfolioDeskDemo chrome={false} />
      </div>
    </div>
  )
}
