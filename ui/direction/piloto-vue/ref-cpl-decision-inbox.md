# REF-cpl-decision-inbox · referencia visual de `decision-inbox` en CPL

- reference_id: `REF-cpl-decision-inbox`
- screen_id: `decision-inbox`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/decision-inbox`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/piloto-vue.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/decision-inbox/desktop-light-reduced.png` | `4ec1d5d1188f5e4128d5d38ab98349c9b97b803f419fd166662478554aa7c71d` |
| `before/decision-inbox/desktop-dark-reduced.png` | `9311c04e1219417da6651e19a47292fc580d8b8aca7c39949675e146e18d08ae` |
| `before/decision-inbox/390-light-reduced.png` | `d378e6570f612cd58d8885f73af862750a762ec48e5c342eec8d00fc2ac4bb40` |
| `before/decision-inbox/390-dark-reduced.png` | `1e1ea85e1e8edefe2e4ffa0c82d6300355280ece6e4bcf35c707c4c8638053bf` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/piloto-vue/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 1
