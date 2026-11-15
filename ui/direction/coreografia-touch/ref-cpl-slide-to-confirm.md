# REF-cpl-slide-to-confirm · referencia visual de `slide-to-confirm` en CPL

- reference_id: `REF-cpl-slide-to-confirm`
- screen_id: `slide-to-confirm`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/slide-to-confirm`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/coreografia-touch.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/slide-to-confirm/desktop-light-reduced.png` | `60a6cf36514325a4445932a99f4df3c1b74004af6ec1fe6dbd098cc38367172a` |
| `before/slide-to-confirm/desktop-dark-reduced.png` | `d738e84c4622d46b4418c2b785399b8f1b3e81a7b4c29c14bf59c6a213374574` |
| `before/slide-to-confirm/390-light-reduced.png` | `7f75b92f3a31d2c1adbdf06d82b50f2575536601d5ab22a33cc07ecb07907ae7` |
| `before/slide-to-confirm/390-dark-reduced.png` | `fbdcfb402e9a79cd88debac887185b5e3e50a1161caa9b80dcef7a469c7f04e2` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/coreografia-touch/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 2
