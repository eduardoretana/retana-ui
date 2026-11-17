# REF-cpl-view-calendar · referencia visual de `view-calendar` en CPL

- reference_id: `REF-cpl-view-calendar`
- screen_id: `view-calendar`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/view-calendar`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/coreografia-touch.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/view-calendar/desktop-light-reduced.png` | `4ffbb21ae4bf87b98f11f6a19b2afefbb437e6d45ab37526d2daf920272e8817` |
| `before/view-calendar/desktop-dark-reduced.png` | `c3a6fcf780fd0134adac044800b85e072f3f1aadde83950898568a916c0729c8` |
| `before/view-calendar/390-light-reduced.png` | `7e5c58e550948f4aab4b05821b022f7aee0f19ac695224f3810d39cd2a865404` |
| `before/view-calendar/390-dark-reduced.png` | `de2d221fd5be776358bfa633323593d31fd33bf4e135525e3c9abbab68ed18d6` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/coreografia-touch/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 2
