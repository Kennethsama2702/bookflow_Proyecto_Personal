# BookFlow — Reinicio con estructura por módulo

Este es el esqueleto del proyecto, sin lógica todavía. Cada archivo `.ts` tiene
un comentario `// TODO` que dice qué va a vivir ahí — lo llenamos juntos, pieza
por pieza, empezando por `auth`.

## Cómo vamos a trabajar (acordado)

- Yo genero el código cuando lo pidas, explicando el porqué de cada decisión.
- Tú diriges el diseño y, sobre todo, **resuelves los problemas cuando algo
  falla**: me traes el error, te explico qué significa, tú decides el arreglo.
- Orden: primero toda la lógica corriendo local (Node + MySQL directo en tu
  máquina, sin contenedores) hasta que la entiendas completa. Docker y
  Kubernetes van al final, con explicación a fondo de cada pieza — no solo
  "corre este comando". Después, AWS.

## Decisiones ya tomadas (y por qué)

| Decisión                                                | Por qué                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estructura **por módulo**, no por capa global           | Cada feature (`auth/`, `bookings/`, `chat/`) trae sus propias capas adentro (`routes`, `controller`, `service`, `repository`, `errors`). Escala mejor: agregar `dashboard/` o `ai-assistant/` no mezcla archivos de módulos distintos en la misma carpeta.                                                            |
| **MySQL** en vez de Postgres                            | Es la que ya usas localmente. Ojo: MySQL no soporta índices únicos parciales (`CREATE UNIQUE INDEX ... WHERE ...`) como Postgres — para el `UNIQUE INDEX` que evita el doble-booking vamos a necesitar una columna generada como alternativa. Se explica a fondo cuando lleguemos a `bookings/booking.repository.ts`. |
| **`mysql2` con SQL crudo**, no un ORM                   | Así ves exactamente qué SQL se ejecuta y por qué falla cuando falla — encaja con lo que quieres practicar de administración de BD. Un ORM es un ejercicio aparte y opcional más adelante, no depende de Docker.                                                                                                       |
| Migraciones en `db/migrations/`, no un `init.sql` único | Cada cambio de esquema queda como un archivo numerado separado — así puedes ver la historia de cómo evolucionó la base de datos, en vez de un solo archivo que se edita encima.                                                                                                                                       |

## Estructura

```
bookflow/
├── docs/                      # decisiones y notas de arquitectura
├── db/
│   └── migrations/            # un archivo por cambio de esquema
├── api/
│   ├── src/
│   │   ├── server.ts          # arranca Express (+ Socket.IO más adelante)
│   │   ├── app.ts              # arma la app, conecta los módulos
│   │   ├── db.ts               # conexión a MySQL
│   │   ├── config/env.ts       # variables de entorno centralizadas
│   │   ├── shared/errors/      # clase base de error de dominio
│   │   ├── auth/               # register, login, JWT, middleware
│   │   ├── bookings/           # reservas + el UNIQUE index
│   │   ├── chat/                # Socket.IO (se completa después de bookings)
│   │   ├── dashboard/           # futuro
│   │   └── ai-assistant/        # futuro
│   └── test/
```

## Siguiente paso

Empezamos por `auth/` — es la base de todo lo demás (bookings y chat ya
dependen de tener un usuario identificado). Antes de escribir código:
vamos a diseñar juntos la tabla `users` en MySQL y el primer archivo de
migración.

## Autenticación en producción

La API requiere `JWT_SECRET` con al menos 32 caracteres aleatorios. Copia
`api/.env.example` a `api/.env` y configura también `CORS_ORIGINS` con los
orígenes reales, separados por comas.

Para bases existentes, aplica `db/migrations/002_auth_sessions.sql`. Las
rutas de registro y login devuelven un access token de corta duración y crean
un refresh token rotatorio en una cookie `HttpOnly`; `/auth/refresh` renueva la
sesión y `/auth/logout` la revoca.
