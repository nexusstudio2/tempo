# Esquema inicial: identidad y multitenancy

La migración inicial `V0001__identity__create_tenants_users_branches.sql` crea el núcleo de identidad y negocio.

| Tabla | Propósito | Claves y restricciones principales |
|---|---|---|
| `users` | Perfil interno ligado a Cognito | UUID binario, `cognito_subject` único, email único, estado |
| `tenants` | Establecimientos y espacios de Koaliado | UUID, `slug` único, estado, zona horaria |
| `branches` | Sucursales dentro de un tenant | `tenant_id`, FK al tenant, unicidad de nombre por tenant y clave compuesta `(tenant_id,id)` |
| `tenant_memberships` | Acceso de usuario a negocio/rol/sucursal | FKs de usuario y tenant; FK compuesta impide asignar una sucursal de otro tenant |
| `platform_admins` | Roles globales de Koaliado | Separado de las membresías de negocio; sujeto a MFA en el proveedor de identidad |
| `tenant_settings` | Ajustes configurables del negocio | Una fila por tenant; actor y fecha de cambio |
| `audit_events` | Registro append-only de acciones sensibles | Tenant opcional para acciones globales, actor, recurso y correlation ID |

## Convenciones

- UUID almacenados como `BINARY(16)`; serialización HTTP en formato UUID estándar.
- Todas las entidades de negocio incluyen `tenant_id` y consultan con ese alcance.
- Las fechas se guardan en UTC con precisión de microsegundos.
- Las bajas de personas y membresías cambian estado; no borran historial de auditoría.
- No se guarda contraseña de Cognito ni token de sesión en estas tablas.
- Los límites de plan no se codifican en este primer esquema; llegan con `saas-billing`.

Este diseño inicial necesita cotejarse con el inventario completo de la especificación V2.1 antes de cerrar las tablas de clientes, pagos, membresías y reservas. No modificar migraciones una vez aplicadas; crear una nueva versión Flyway.
