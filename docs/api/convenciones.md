# Convenciones de la API v1

Contrato: `contracts/openapi/tempo-api.v1.yaml` (fuente de verdad). Estado: borrador 1.

| Tema | Regla |
|---|---|
| Errores | `{ code, message, details?, correlationId }`. El `code` es estable (snake_case); el `message` es solo para mostrar. |
| Paginación | Por cursor: `limit` (1-100, por defecto 25) y `cursor`. Respuesta `{ items, nextCursor }`. |
| Orden y filtros | `sort=-createdAt`; filtros por nombre de campo (`status`, `branchId`, `q`). |
| Tenant | Nunca en ruta ni cuerpo. Sale del contexto activo. Un recurso de otro tenant responde 404, no 403. |
| Dinero | `{ amount, currency }` en unidades menores, moneda ISO 4217. |
| Fechas | UTC, ISO 8601. La zona horaria del establecimiento solo se usa para mostrar. |
| Identificadores | UUID. |
| Idempotencia | Encabezado `Idempotency-Key` en operaciones críticas. |
| Trazabilidad | `X-Correlation-Id` en peticiones y respuestas. |
| Permisos | `x-required-permission` por operación. Nombres fuera de la spec 6.2 son propuestas. |

## Decisiones de esta tanda (revisar)

1. **`/tenants/current` en lugar de `/tenants`.** La spec 13.2 lista `/tenants`, pero con el tenant tomado del contexto un listado no tiene sentido para roles de negocio. El listado y el alta quedan en `/admin/tenants`.
2. **Baja de cliente = `DELETE /customers/{id}`** con baja lógica (el historial se conserva).
3. **Inicio de sesión fuera de la API.** Lo hace Cognito (Authorization Code + PKCE) detrás de un BFF; la API solo expone `/auth/me`, `/auth/sessions` y `/auth/logout`.
4. **Métodos de asistencia** incluyen `FINGERPRINT`, `FACE` y `CARD` además de `QR` y `MANUAL`. Es una ampliación respecto a la spec V2.1 (solo QR): requiere revisión de alcance y de privacidad.
5. **Esqueletos.** Membresías, pagos y asistencias del cliente son de solo lectura y mínimos; se completan en las Etapas 3 y 5.
6. **Nombre de la cookie** (`tempo_session`) es provisional.

## Pendiente

- Códigos de error concretos por módulo (`membership_expired`, `plan_limit_reached`, ...).
- Límites de rate limiting por endpoint.
- Siguiente tanda: membresías, pagos, asistencia, clases y reservas.
