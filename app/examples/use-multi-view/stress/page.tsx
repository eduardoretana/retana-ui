"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunityViews } from "@/app/examples/multi-view/data"
import { useMultiView } from "@/registry/hooks/use-multi-view"

export default function UseMultiViewStressPage() {
  return (
    <ExampleFrame title="useMultiView stress" description="El hook no dibuja filas. El marco estrecho solo comprueba el control.">
      <div className="w-[320px] max-w-full rounded-lg border border-border p-2">
        <Probe />
      </div>
    </ExampleFrame>
  )
}

function Probe() {
  const state = useMultiView({ views: opportunityViews })
  return <p className="text-sm">{state.viewId}</p>
}
