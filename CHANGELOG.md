# Changelog

## V1.0.0 - 2026-03-09

- Creación inicial del proyecto SlackwareAlbert.
- Implementación de arquitectura separada backend/frontend en PHP.
- API REST para canales y mensajes.
- Frontend estilo Slack con canales, chat y creación de canales.
- Persistencia SQLite.
- Configuración de build con inclusión de favicon `.ico`.
- Documentación completa y licencia Apache 2.0.
- Workflow de GitHub Actions para release automático en `main`.

## V1.0.1 - 2026-03-09

- ActualizaciÃ³n de versiÃ³n automÃ¡tica (patch).

## V1.1.0 - 2026-03-09

- Corregido entry point principal: `index.php` ahora redirige a `public/` para resolver rutas relativas y evitar bloqueo en "Cargando mensajes...".
- Agregado soporte de usuarios persistentes en backend con nuevo modelo `User` y endpoint `action=users` (GET/POST).
- Agregada tabla `users` en SQLite con usuario semilla por defecto (`Albert`).
- Mejorado manejo de errores de API (validaciones y conflictos por datos duplicados).
- Frontend actualizado para crear/seleccionar usuario desde modal.
- Frontend actualizado para crear canales con mensajes de resultado.
- Incorporado soporte de idiomas (Espanol/Ingles) con selector en UI.
- Alineado versionado semantico en `VERSION`, `package.json`, `public/version.json`, UI y documentacion.

## V1.1.1 - 2026-03-09

- Agregado `pre-commit` en `.githooks/pre-commit` para exigir version nueva por commit.
- Nuevo script `scripts/enforce-version-commit.js` para validar sincronizacion de version y changelog.
- Nuevos comandos npm: `version:check` y `hooks:install`.
- Documentada la instalacion/uso de hooks en `README.md`.

