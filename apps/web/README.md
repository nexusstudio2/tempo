# apps/web

Next.js (App Router) + TypeScript + Tailwind. Mobile-first y PWA.

## Primera instalación

Las versiones **no están fijadas de memoria**: `npm install` las escribe en `package.json` y
`package-lock.json` queda como registro. Revisa compatibilidad antes de confirmarlas (spec 4.2).
Verificado al armar esto: Next.js 16.4.x es la línea estable actual.

**Windows (PowerShell)**

```powershell
cd apps\web
npm install next@16.4 react@19 react-dom@19 zod @tanstack/react-query react-hook-form @hookform/resolvers
npm install -D typescript@5 @types/node @types/react @types/react-dom tailwindcss@4 @tailwindcss/postcss@4 eslint eslint-config-next prettier vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
npx playwright install chromium
Copy-Item .env.example .env.local
$mockKey = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Add-Content .env.local "MOCK_SESSION_SECRET=$mockKey"
npm run dev
```

**macOS / Linux (bash)**

```bash
cd apps/web
npm install next@16.4 react@19 react-dom@19 zod @tanstack/react-query react-hook-form @hookform/resolvers
npm install -D typescript@5 @types/node @types/react @types/react-dom tailwindcss@4 @tailwindcss/postcss@4 eslint eslint-config-next prettier vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
npx playwright install chromium
cp .env.example .env.local
npm run dev
```

Cada terminal nueva abre en la raíz del proyecto: repite el `cd` hacia `apps/web`.
Evita guardar el proyecto dentro de OneDrive (`node_modules` tiene miles de archivos).

Abre http://localhost:3000. Con `NEXT_PUBLIC_USE_MOCKS=true`, el login demo solo acepta las
cuentas locales documentadas en `lib/server/mock-auth.ts` y ofrece únicamente los espacios
asignados a esa cuenta. `carlos@correo.com` / `cualquiera` puede elegir entre los cinco espacios;
las cuentas `@tempo.test` tienen un único rol y usan la contraseña `TempoDemo2026!`:
`superadmin@tempo.test`, `propietario@tempo.test`, `recepcion@tempo.test`,
`instructor@tempo.test` y `cliente@tempo.test`.

## Comprobaciones

```bash
npm run typecheck && npm run lint && npm run test && npm run test:e2e
```

Estado: `typecheck`, `lint`, `test` y `test:e2e` pasan.

## Qué hay

- `app/` rutas por grupo: `(auth)`, `(superadmin)`, `(business)`, `(staff)`, `(customer)`.
  Las pantallas están implementadas como componentes React y TypeScript separados por rol en `features/screens/` (`business`, `superadmin`, `reception`, `instructor`, `customer`) con piezas compartidas en `common.tsx`.
- `components/ui` piezas base con las medidas del prototipo (botón 52 px, radio 14 px).
- `features/contexts` roles, contextos y a qué ruta lleva cada rol.
- `lib/api-client.ts` llamadas a `/api/v1` con validación Zod, Correlation ID e idempotencia.
- `services/auth.service.ts` modo mock o real según `NEXT_PUBLIC_USE_MOCKS`.
- `public/sw.js` y `app/manifest.ts` PWA: instalable, sin guardar nunca respuestas de la API.

## Pendiente para el modo real

- El BFF ya implementa Cognito Authorization Code + PKCE (`app/api/auth/*`), guarda tokens en una cookie cifrada `HttpOnly`
  y agrega el access token como Bearer al reenviar `/api/v1/*` a Spring. El navegador nunca recibe tokens.
- Para habilitarlo falta crear el User Pool/App Client de Koaliado, permitir authorization-code + PKCE y configurar en
  `.env.local` los valores de Cognito y una clave `SESSION_ENCRYPTION_KEY` aleatoria. Los callback/sign-out URLs locales
  son `http://localhost:3000/api/auth/callback` y `http://localhost:3000/login`; en producción solo HTTPS.
- App Client: usar Authorization Code grant, PKCE S256, refresh tokens y scopes `openid`, `email`, `profile`; registrar
  callback y sign-out URLs exactamente como arriba, y usar un client secret porque el intercambio ocurre en el servidor.
  Nunca habilitar implicit grant ni publicar el secret con prefijo `NEXT_PUBLIC_`.
- `apps/web/.env.local`: dominio HTTPS del User Pool, App Client ID/secret y `SESSION_ENCRYPTION_KEY`. En el `.env` raíz:
  el mismo App Client ID y `COGNITO_ISSUER_URI=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>` para Spring.
- Sin Cognito, `NEXT_PUBLIC_USE_MOCKS=true` conserva el modo de demostración; para probar Cognito debe ponerse en `false`.
- El proxy ya entrega Bearer a la API, pero el flujo completo espera que Spring implemente `/contexts`, `/contexts/active`
  y `/contexts/switch` y que haya usuarios/membresías provisionados. Todavía no se pueden probar pantallas con datos reales.
- MFA obligatorio para `SUPER_ADMIN` se integra al terminar el flujo de autenticación del BFF.
- En modo demo, el servidor firma una cookie local HttpOnly, valida cada credencial y limita el cambio de contexto
  a los roles asignados. Los layouts de server guard bloquean rutas fuera del rol activo.
- El formato de errores de la API se define en `docs/api`; el cliente asume `{ code, message }`.

Para generar una clave de desarrollo en PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Pega el resultado en `SESSION_ENCRYPTION_KEY` dentro de `apps/web/.env.local`. No lo guardes en Git ni uses esta clave en producción.

## Tipos desde el contrato de la API

Los tipos de TypeScript se generan desde `contracts/openapi/tempo-api.v1.yaml`, no se escriben a mano.

```powershell
npm install -D openapi-typescript
npm pkg set scripts.api:types="openapi-typescript ../../contracts/openapi/tempo-api.v1.yaml -o lib/api-types.ts"
npm run api:types
```

Vuelve a correr `npm run api:types` cada vez que cambie el contrato. `lib/api-types.ts` se confirma en Git.
