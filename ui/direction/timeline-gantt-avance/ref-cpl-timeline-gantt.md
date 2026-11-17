# REF-cpl-timeline-gantt · referencia visual de `timeline-gantt` en CPL

- reference_id: `REF-cpl-timeline-gantt`
- screen_id: `timeline-gantt`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/timeline-gantt`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/timeline-gantt-avance.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/timeline-gantt/desktop-light-reduced.png` | `f273a680b6f67e5dbe9c404ebbf626e2583c59ab11c549fbf86cae183163be85` |
| `before/timeline-gantt/desktop-dark-reduced.png` | `b91da6a5f426ca37048cf027e61e857959e4bf28a448175fba57e34d09b214d0` |
| `before/timeline-gantt/390-light-reduced.png` | `0cb8a06ba51415e639231501ebaac77b869a3e59fa6b61db63837fcb39dd1192` |
| `before/timeline-gantt/390-dark-reduced.png` | `7945dc344c85ce586b35824d34896bba60e343db6843a7fbdf149b25b816d8e6` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/timeline-gantt-avance/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 1
