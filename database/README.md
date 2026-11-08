# database

Aurora MySQL. Las migraciones se versionan con Flyway.

- Nombre: `V<numero>__<modulo>__<descripcion>.sql`, por ejemplo `V0005__payments__create_payments.sql`. Para cambios transversales usa `shared` como módulo. Nunca se editan migraciones ya aplicadas.
- UUID como identificador, `tenant_id` en toda entidad empresarial, fechas en UTC, dinero en unidades menores con moneda ISO 4217.
- El inventario lógico de tablas está en la spec, sección 12.2. El diseño físico va en `docs/database/`.
