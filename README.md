# Tempo

Plataforma SaaS de gestión para negocios con clientes recurrentes. Producto de **Koaliado**.
Referencia funcional: *Especificación técnica y funcional V2.1*.

## Estructura

| Carpeta | Contenido |
|---|---|
| `apps/web` | Frontend: Next.js (App Router), TypeScript, PWA |
| `services/api` | Backend: monolito modular Java + Spring Boot |
| `database` | Migraciones Flyway (fuente de verdad) y datos semilla |
| `contracts/openapi` | Contrato de la API REST (`/api/v1`) |
| `infrastructure` | Terraform (AWS) y Docker |
| `docs` | Arquitectura, base de datos, API, seguridad, reglas de negocio, diseño, pruebas, operación, legal |
| `scripts` | Utilidades de desarrollo y despliegue |
| `.github` | CI/CD, plantillas y CODEOWNERS |

## Reglas que no se negocian

- Un solo login (Cognito). El contexto activo se valida siempre en el backend.
- Cero acceso cruzado entre tenants: todo registro empresarial lleva `tenant_id`.
- Ningún token de sesión en `localStorage`.
- Cada módulo del backend tiene sus capas `domain / application / infrastructure / presentation` y no accede a las tablas de otro módulo.
- Los cobros de Koaliado (`saas-billing`) y los de los establecimientos (`payments`) nunca se mezclan.

## Estado

Etapa 1 en curso. La API ya tiene un proyecto Spring Boot ejecutable, configuración para MySQL/Flyway,
Actuator, trazabilidad por correlación y un esquema inicial para identidad, establecimientos, sucursales,
membresías y auditoría. Los casos de uso y endpoints de negocio siguen pendientes; consulta
`services/api/README.md` para preparar el entorno local.
