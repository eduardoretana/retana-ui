"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { Sparkline } from "@/registry/ui/sparkline"

const firings = [18, 22, 19, 28, 24, 31, 27, 36]
const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom", "Lun"]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <Sparkline className="max-w-sm" data={firings} label="Cono del horno" value="36" change="+8" labels={days} />
      <StressCases
        empty={<Sparkline data={[]} label="Sin lecturas" />}
        long={<Sparkline data={firings} label={unbreakable} value="36" change="+8" />}
        crowded={
          <div className="flex flex-col gap-3">
            {firings.map((value, index) => (
              <Sparkline key={index} data={firings.slice(0, index + 1).concat(value)} label={`Serie ${index + 1}`} value={String(value)} />
            ))}
          </div>
        }
      />
    </div>
  )
}
