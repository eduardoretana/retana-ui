# Plan de pruebas — piloto-vue

La fase PRUEBAS corre antes del código de las piezas.

1. `pnpm exec vitest run ui-tests/piloto-vue.test.ts`  
   Contrato de tokens, puente, SFC, fixtures, Razor, manifiesto y status. Tiene que fallar con las firmas de `expected-red.yaml`.
2. `pnpm --dir vue exec vitest run`  
   Mount y navegador. En esta fase el módulo de escenas no existe: cada caso falla en su `gate`.

Un caso verde en este commit invalida la fase. El build llega en el commit siguiente. El log de esta corrida está en `ui-tests/logs/expected-red.log`.
