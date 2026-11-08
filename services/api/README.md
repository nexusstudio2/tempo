# services/api

API de Tempo como monolito modular, Java 21 y Spring Boot 3.5.16. Paquete raíz: `com.koaliado.tempo`.

```
src/main/java/com/koaliado/tempo/
  shared/            tenancy, security, idempotency, outbox, errors, config
  modules/<modulo>/  domain · application · infrastructure · presentation
src/main/resources/  application*.yml
src/test/            JUnit, Mockito, Testcontainers
```

## Arranque local

La opción recomendada usa Docker Desktop con el motor Linux activo para MySQL y Redis; no requiere Java ni Maven si ejecutas la API desde contenedor. Para ejecutar Maven desde Windows directamente, instala JDK 21 y Maven 3.6.3+.

1. En la raíz del repo, copia `.env.example` a `.env` y define `DB_PASSWORD` y `DB_ROOT_PASSWORD`.
2. En la raíz, levanta dependencias: `docker compose --env-file .env -f infrastructure/docker/docker-compose.local.yml up -d`.
3. Desde `services/api`, ejecuta `mvn spring-boot:run` o desde la raíz `./scripts/run-api-local.ps1`.
4. Comprueba `http://localhost:8080/actuator/health`.

Alternativa cuando tengas Cognito configurado: crea la imagen con `docker build -f services/api/Dockerfile -t koaliado/tempo-api .` y ejecútala pasando las mismas variables de base de datos y Cognito. El contenedor escucha en el puerto 8080.

La API requiere `COGNITO_ISSUER_URI` y `COGNITO_CLIENT_ID` para aceptar solicitudes. Solo acepta access tokens firmados para ese user pool/app client; valida issuer, vigencia, `token_use=access` y `client_id`. Si falta cualquiera, inicia cerrada: salud está disponible y las rutas de negocio se rechazan. No hay identidad ni credenciales simuladas.

Flyway usa `../../database/migrations` relativo al directorio `services/api`. Las migraciones se ejecutan al iniciar si MySQL está disponible.

## Reglas de dependencia

- `presentation` -> `application` -> `domain`. `infrastructure` implementa los puertos del dominio.
- Un módulo solo habla con otro por su capa `application` (nunca por sus tablas ni repositorios).
- Todo caso de uso resuelve el tenant desde el contexto autenticado, no desde el cuerpo de la petición.

## Migraciones

La fuente de verdad es `/database/migrations` (Flyway). Se apunta desde la configuración con
`spring.flyway.locations`.

`saas-billing` = cobros de Koaliado a establecimientos (planes, suscripciones, implementaciones). `payments` = cobros de establecimientos a sus clientes.
El endpoint se mantiene como `/admin/subscriptions` (spec 13.2); las tablas llevan el prefijo `saas_`.

## Estado de esta etapa

- Aplicación Spring Boot, configuración externa, Actuator y filtro `X-Correlation-Id`.
- Autenticación JWT de Cognito opcional por configuración, con cierre seguro cuando falta el issuer.
- Migración inicial para identidad, establecimientos, sucursales, membresías de rol, administradores de plataforma, ajustes y auditoría.
- Todavía faltan casos de uso/endpoints de negocio y pruebas de integración. El contrato OpenAPI sigue siendo la fuente de verdad.
