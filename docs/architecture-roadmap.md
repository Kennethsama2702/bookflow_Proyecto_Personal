# BookFlow: arquitectura y roadmap

## Decisiones definitivas

BookFlow sera un sistema hibrido B2C + B2B para una cadena de cine.

- Una API central Node.js + TypeScript + Express.
- Una base de datos MySQL centralizada.
- Clientes React/Vite: Web B2C y Panel B2B.
- Cliente futuro React Native para B2C movil.
- Interfaz web responsive B2B para escaneo y validacion de QR.
- Ningun frontend se conecta directamente a MySQL.
- La logica critica vive en backend: auth, RBAC, disponibilidad, precios, reservas, pagos, tickets y QR.
- Un unico conjunto de servicios de negocio para todos los clientes.

## Fases actualizadas

### Fase 1: Fundacion de plataforma

- [x] Configuracion segura por entorno.
- [x] CORS por allowlist.
- [x] Limite de payload HTTP.
- [x] Cabeceras de seguridad con Helmet.
- [x] Request ID para trazabilidad.
- [x] Health check de API.
- [x] Readiness check de MySQL.
- [x] Respuestas uniformes para errores no controlados.
- [x] Primeras pruebas automatizadas de API.
- [x] Runner y versionado formal de migraciones.
- [x] Logging estructurado con redaccion de datos sensibles.
- [x] Entornos development/test/production completamente separados.

### Fase 2: Identidad, usuarios y autorizacion

- [x] RBAC server-side: ADMINISTRADOR, SUPERVISOR, PERSONAL_ACCESO, PERSONAL_CONFITERIA y CLIENTE.
- [x] Organizaciones, membresías y permisos tenant-aware.
- [x] Creación y listado de organizaciones autenticadas.
- [x] Middleware `X-Organization-Id` + permiso consultado en base de datos.
- [x] CSRF doble cookie/header para refresh y logout web.
- [x] Recuperación de contraseña con tokens de un solo uso y revocación de sesiones.
- [x] Verificación de correo con tokens de un solo uso.
- [x] Auditoría básica de operaciones de membresías por organización.
- [x] Gestión administrativa de miembros y roles con permisos server-side.
- [x] Tests de permisos, aislamiento lógico y CSRF.
- [ ] Integración de proveedor real de correo y plantillas de notificación.
- [ ] Gestión visible y revocable de sesiones activas.
- [ ] Tests de integración RBAC contra MySQL y tests IDOR completos.

### Fase 3: Catalogo y operacion del cine

- Peliculas, generos, sedes, salas, asientos y funciones.
- Precios y reglas de disponibilidad.
- CRUD B2B con autorizacion por permiso y tenant.
- Catalogo, cartelera y busqueda B2C.

### Fase 4: Reservas y concurrencia

- Bloqueo temporal de asientos.
- Checkout con expiracion.
- Transacciones, locks e idempotencia.
- Restricciones para impedir doble reserva.
- Tests concurrentes.

### Fase 5: Confiteria, ordenes y pagos

- Productos, carrito y ordenes.
- PaymentProvider abstracto con sandbox.
- Totales calculados exclusivamente en backend.
- Webhooks firmados, idempotencia y reembolsos.

### Fase 6: Tickets y QR

- Emision solo con pago confirmado.
- QR firmado sin datos sensibles innecesarios.
- Validacion backend de ticket, funcion, sede, pago y uso unico.
- Interfaz movil B2B para escaneo.

### Fase 7: Clientes B2C

- Web B2C completa.
- Cliente React Native consumiendo la misma API.
- Historial, perfil, puntos, recompensas, promociones y notificaciones.

### Fase 8: Panel B2B y analitica

- Dashboard real, reportes, usuarios, roles, permisos y auditoria.
- Operacion de funciones, reservas, ventas y confiteria.

### Fase 9: Chat e IA controlada

- Chat B2C autenticado para Web y movil.
- Chatbot B2C mediante tools de backend.
- Chatbot B2B independiente y limitado por RBAC.
- Nunca permitir LLM -> SQL directo.

### Fase 10: Escalabilidad y auditoria final

- Redis para rate limiting y Socket.IO.
- Jobs para expiracion y notificaciones.
- Cache, paginacion, indices y observabilidad.
- Tests E2E, resiliencia, seguridad y auditoria OWASP.
- Preparacion para CDN/WAF, reverse proxy y multiples instancias.
