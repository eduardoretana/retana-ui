# REF-cpl-stagger-reveal · referencia visual de `stagger-reveal` en CPL

- reference_id: `REF-cpl-stagger-reveal`
- screen_id: `stagger-reveal`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/stagger-reveal`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/coreografia-touch.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/stagger-reveal/desktop-light-reduced.png` | `1e1ca7793e0029834410ba5a6862e8b0fe04987226bda6b307f76347de83da18` |
| `before/stagger-reveal/desktop-dark-reduced.png` | `ccbba217a4de2db6ca960282f2c7970bdea6d342f3288f643f905b2f19b9288c` |
| `before/stagger-reveal/390-light-reduced.png` | `0da2c78b38329a0f75e8ec1c3c49b230604c67c00dcf4d6a946f892d6bf70814` |
| `before/stagger-reveal/390-dark-reduced.png` | `d4c50f363de7a2a03e8ccc9a3c644c09e384894f91b4c72d50cbfc55094229e8` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/coreografia-touch/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 4
