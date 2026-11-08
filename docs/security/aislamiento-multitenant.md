# Aislamiento multitenant: reglas iniciales

## Activos y amenazas

- Datos de clientes, pagos, asistencia y operación de cada establecimiento.
- Usuarios que intentan cambiar identificadores para consultar otro tenant o sucursal.
- Solicitudes falsificadas, tokens vencidos, exposición de secretos o errores que revelan si existe un recurso ajeno.

## Controles obligatorios

1. La API valida la firma, issuer y vigencia del JWT de Cognito; exige `token_use=access` y el `client_id` configurado; identidad sale de `sub`.
2. La membresía activa se consulta en base de datos. Un claim no reemplaza el control de pertenencia ni de rol.
3. El tenant y sucursal efectivos se resuelven en servidor desde la sesión/contexto autenticado.
4. Las consultas, actualizaciones y deletes de negocio filtran por `tenant_id`; los IDs de recursos ajenos responden 404.
5. Las relaciones con sucursales usan FK compuesta `(tenant_id, branch_id)`.
6. Los administradores de Koaliado viven en `platform_admins`, usan MFA y no reciben acceso implícito a un tenant.
7. Las acciones sensibles escriben `audit_events`; no se guardan contraseñas, tokens ni datos completos de tarjeta en eventos.
8. La API no acepta CORS de navegador externo. El BFF comparte origen, guarda tokens en cookie cifrada `HttpOnly` y reenvía Bearer al backend; comprueba el `Origin` en métodos con cambios y usa `SameSite=Lax`.

## Límite actual

La primera configuración de Spring Boot solo deja públicos los checks de salud. Las rutas de API quedan cerradas si falta Cognito. El BFF está implementado, pero falta configurar el User Pool y App Client. MFA administrable, endpoints y sincronización de identidad, y pruebas de acceso cruzado siguen pendientes antes de habilitar operaciones reales.
