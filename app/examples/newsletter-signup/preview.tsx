"use client"

import { NewsletterSignup } from "@/registry/blocks/newsletter-signup"

export default function NewsletterSignupPreview() {
  return (
    <div className="h-full bg-background p-3">
      <NewsletterSignup
        className="[&_h2]:text-xl"
        title="El boletín"
        description="Cada viernes, una nota del taller."
        publication={null}
        readers={{ count: 480, faces: ["Inés Calderón", "Mateo Ruiz"] }}
        buttonLabel="Suscribirme"
        placeholder="hola@costa-atelier.example"
      />
    </div>
  )
}
