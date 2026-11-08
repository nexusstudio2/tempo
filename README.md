# Tempo

Plataforma SaaS de gestión para negocios con clientes recurrentes. Producto de **Libiter**.
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
- Los cobros de Libiter (`saas-billing`) y los de los establecimientos (`payments`) nunca se mezclan.

## Estado

Etapa 0 (Fundamentos). Este repositorio solo contiene la estructura: **no se fijaron versiones**
de dependencias; se eligen verificando compatibilidad y soporte (especificación, sección 4.2).
