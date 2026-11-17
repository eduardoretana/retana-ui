# REF-cpl-view-timeline · referencia visual de `view-timeline` en CPL

- reference_id: `REF-cpl-view-timeline`
- screen_id: `view-timeline`
- kind: `visual` (UI vigente del catálogo; Anti-Slop `mode=preserve`)
- origen: render de producción (`next build && next start`) de `eduardoretana/retana-ui@33438d12520bbf9fe18ebc87f29df2a3122d02b6` (CPL), ruta `/examples/view-timeline`, arnés `21db9481b331` (`shoot.mjs`), claro y oscuro, reduced motion.
- valid_for_spec_version: `1.0.0` de `ui/specs/coreografia-touch.spec.md`
- status: `current`
- licencia: capturas propias del catálogo (MIT del repo). No son assets de terceros.
- en el repo: no. Las PNG viven en el box; este archivo fija ruta y sha256.

Carpeta del control: `/workspace/retana-ui-entregas/pr-sweep/cpl-control-sweep2` (MANIFEST.sha256 `a6ed2081dd628e9e9af5a8337fa8840c4e61d42030ab84e3e62aa759d26de1fb`).

| Archivo (relativo a la carpeta del control) | sha256 |
|---|---|
| `before/view-timeline/desktop-light-reduced.png` | `0e809499760b0f44e908fb7382fc7b4b519e18c5a32a3242a5426747d82d1157` |
| `before/view-timeline/desktop-dark-reduced.png` | `4d2731b9d680d9a9301a2f41cc74084c354a402f72e53c3a6ff1ef0b1eaef466` |
| `before/view-timeline/390-light-reduced.png` | `74717976761a3df1b1b20767813b35736379210d094b23f4b7b6faa5f03a35f5` |
| `before/view-timeline/390-dark-reduced.png` | `9f2493b37e90dd47d2248c2c684b6d0af69b670243fb0680b5f679f79280e302` |

Uso: la pieza ya existe en CPL. El Auditor compara la pantalla del head contra esta referencia (lado a lado, AUDITOR §5.4) en presencia, orden, jerarquía y densidad. Las desviaciones están en `ui/direction/coreografia-touch/direction-map.md`, cada una con su cita.

Elección: propuesta del builder. En STANDARD la elige el UI Lead (SKILL §4); `chosen_by` queda vacío hasta que el Lead la confirme en el sobre. No es una decisión de Eduardo ni una excepción D2.

Revisión de ficha: 1
