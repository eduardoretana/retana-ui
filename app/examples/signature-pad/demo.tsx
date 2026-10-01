"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { SignaturePad } from "@/registry/ui/signature-pad"

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <SignaturePad signer={atelier.name} label="Firma del taller" fileName="firma-taller" />
      <StressCases
        empty={<SignaturePad label="Firma vacía" hint="" />}
        long={<SignaturePad label="Firma" signer={unbreakable} />}
        crowded={
          <div className="flex flex-col gap-3">
            {people.slice(0, 10).map((person) => (
              <SignaturePad key={person.id} label={`Firma de ${person.name}`} signer={person.name} hint={person.role} />
            ))}
          </div>
        }
      />
    </div>
  )
}
