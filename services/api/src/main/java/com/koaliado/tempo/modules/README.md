# Módulos

Se crean cuando llega su etapa. Cada uno trae `domain / application / infrastructure / presentation`.

| Etapa | Módulos |
|---|---|
| 1 Identidad y multitenancy | `identity`, `tenants`, `branches`, `audit` |
| 2 Administración | `customers`, `employees` |
| 3 Membresías y finanzas | `memberships`, `payments`, `saas-billing` |
| 5 Asistencia QR | `attendance` (incluye dispositivos de acceso) |
| 6 Clases y reservaciones | `scheduling`, `reservations` |
| 7 Notificaciones y reportes | `notifications`, `analytics` |

Pendiente de decidir antes de la Etapa 5: si la asistencia a clase y el acceso al establecimiento son un solo registro (spec 10.4).
