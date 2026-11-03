# Ejemplos

Todos los números y nombres son ficticios. Cuenta `marca-sintetica`. Teléfono `+52 55 0000 0000` (`+525500000000` en el dato). Repositorio `ejemplo/demo`, pull request `0`. Personas: Asesora Demo, Cliente Ficticio, revisor-ficticio, editor-ficticio.

## Envío que sí puede seguir

`syntheticSafeSend()`. Tema `mejoravit`, oferta `none` no validada pero sin promesa en el texto, secretos `[]`, la persona sí escribió primero. Decisión `allow`. El log igual se anota.

## “Hasta $36 mil” sin dato validado

`syntheticUnvalidatedOffer()`. Decisión `block`, regla `block-unvalidated-offer`.

## La misma frase con el dato validado

`syntheticValidatedOffer()`. `offer.validated` es `true`. Esa regla no dispara. Decisión `allow`.

## Merge

`syntheticGitMerge()` contra `gitMergeApprovalRuleset`. `checksGreen: true` pide `require_approval`. El ticket queda en el `ApprovalGate` con `kind: "git.merge"`.

El demo de `/herramientas` crea ese ticket con el botón “Pedir aprobación de git.merge”.

## Webhook de ejemplo

`mapExampleCrmWebhook` copia solo los campos que vienen. No inventa `topic`. Si el host no manda `topic` en un `whatsapp.before_send`, el preset no puede decidir “en tema” y la evaluación queda fail-closed.

No llames a ningún host externo. La función no abre sockets.
