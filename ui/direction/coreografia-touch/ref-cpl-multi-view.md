# REF-cpl-multi-view · referencia visual de `multi-view` en CPL

- reference_id: `REF-cpl-multi-view`
- screen_id: `multi-view`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/multi-view`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/coreografia-touch.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/multi-view/desktop-light-reduced.png` | `a69986145b9ba43d7b6d2d4e9046bdf181efab4d667265066b468427f5f59e0e` |
| `before/multi-view/desktop-dark-reduced.png` | `fe1971c1481fff55f9e7e091fb17423ec2302ab536877992c792cd3815c21ef0` |
| `before/multi-view/390-light-reduced.png` | `5f919c471aa075c5c2039a239210869246b0480c572fcfb4d659cc7dd4599e01` |
| `before/multi-view/390-dark-reduced.png` | `aa53cfd7bb69932b5a44914f70dd0c20c454e7a3e09d5c5d17f02a526d4199d7` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/coreografia-touch/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 1
