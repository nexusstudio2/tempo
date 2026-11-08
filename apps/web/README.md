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

Abre http://localhost:3000. Con `NEXT_PUBLIC_USE_MOCKS=true` el login acepta cualquier correo
válido y contraseña, y ofrece cinco contextos de ejemplo.

## Comprobaciones

```bash
npm run typecheck && npm run lint && npm run test && npm run test:e2e
```

Estado: `typecheck`, `lint`, `test` y `test:e2e` pasan.

## Qué hay

- `app/` rutas por grupo: `(auth)`, `(superadmin)`, `(business)`, `(staff)`, `(customer)`.
  Las pantallas de destino son marcadores; el diseño está en `docs/design/prototypes/`.
- `components/ui` piezas base con las medidas del prototipo (botón 52 px, radio 14 px).
- `features/contexts` roles, contextos y a qué ruta lleva cada rol.
- `lib/api-client.ts` llamadas a `/api/v1` con validación Zod, Correlation ID e idempotencia.
- `services/auth.service.ts` modo mock o real según `NEXT_PUBLIC_USE_MOCKS`.
- `public/sw.js` y `app/manifest.ts` PWA: instalable, sin guardar nunca respuestas de la API.

## Pendiente para el modo real

- El inicio de sesión real es Cognito con Authorization Code + PKCE detrás de un BFF
  (`app/api/auth/*`, sin crear todavía). El navegador solo recibe cookies HttpOnly.
- MFA obligatorio para `SUPER_ADMIN` (el prototipo lo muestra en el login).
- El formato de errores de la API se define en `docs/api`; el cliente asume `{ code, message }`.

## Tipos desde el contrato de la API

Los tipos de TypeScript se generan desde `contracts/openapi/tempo-api.v1.yaml`, no se escriben a mano.

```powershell
npm install -D openapi-typescript
npm pkg set scripts.api:types="openapi-typescript ../../contracts/openapi/tempo-api.v1.yaml -o lib/api-types.ts"
npm run api:types
```

Vuelve a correr `npm run api:types` cada vez que cambie el contrato. `lib/api-types.ts` se confirma en Git.
