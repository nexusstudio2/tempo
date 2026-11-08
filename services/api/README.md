# services/api

Monolito modular (Java + Spring Boot). Paquete raíz: `com.libiter.tempo`.

```
src/main/java/com/libiter/tempo/
  shared/            tenancy, security, idempotency, outbox, errors, config
  modules/<modulo>/  domain · application · infrastructure · presentation
src/main/resources/  application*.yml
src/test/            JUnit, Mockito, Testcontainers
```

## Reglas de dependencia

- `presentation` -> `application` -> `domain`. `infrastructure` implementa los puertos del dominio.
- Un módulo solo habla con otro por su capa `application` (nunca por sus tablas ni repositorios).
- Todo caso de uso resuelve el tenant desde el contexto autenticado, no desde el cuerpo de la petición.

## Migraciones

La fuente de verdad es `/database/migrations` (Flyway). Se apunta desde la configuración con
`spring.flyway.locations`.

`saas-billing` = cobros de Libiter a establecimientos (planes, suscripciones, implementaciones). `payments` = cobros de establecimientos a sus clientes.
El endpoint se mantiene como `/admin/subscriptions` (spec 13.2); las tablas llevan el prefijo `saas_`.
