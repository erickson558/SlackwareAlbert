# SlackwareAlbert

Chat estilo Slack con backend PHP (API REST) y frontend JavaScript, con persistencia SQLite.

Version actual: `V1.1.0`

## Funcionalidades

- Canales de chat (listar y crear).
- Mensajes en tiempo real por polling.
- Gestion de usuarios (crear y seleccionar usuario activo).
- Interfaz multilenguaje (Espanol / English).
- Persistencia local con SQLite (`data/slackware.db`).
- Versionado semantico sincronizado en app y repositorio.

## Estructura del proyecto

- `index.php`: entry point, redirecciona a `public/`.
- `api/index.php`: entry point de la API.
- `src/config/Database.php`: conexion e inicializacion de tablas.
- `src/controllers/ApiController.php`: rutas y respuestas JSON.
- `src/models/Channel.php`: modelo de canales.
- `src/models/Message.php`: modelo de mensajes.
- `src/models/User.php`: modelo de usuarios.
- `public/index.html`: interfaz principal.
- `public/app.js`: logica frontend.
- `public/version.json`: version visible en UI.
- `VERSION`: version canonica (`Vx.x.x`).
- `CHANGELOG.md`: historial de cambios.

## Requisitos

- PHP 7.4+ (recomendado PHP 8.x).
- Extension `pdo_sqlite` habilitada.
- Navegador moderno.
- Node.js (solo para scripts de build/versionado).

## Ejecucion local

1. Coloca el proyecto en tu servidor local (por ejemplo EasyPHP).
2. Abre en el navegador:
   - App: `http://localhost:888/monitoreos/SlackwareAlbert/`
   - API health rapido: `http://localhost:888/monitoreos/SlackwareAlbert/api/index.php?action=channels`

## API REST

Base URL: `../api/index.php?action=...`

### Canales

- `GET action=channels`: lista canales.
- `POST action=channels`: crea canal.
  - Body JSON: `{ "name": "dev", "description": "Canal de desarrollo" }`

### Mensajes

- `GET action=messages&channel_id=1`: lista mensajes del canal.
- `POST action=messages`: crea mensaje.
  - Body JSON: `{ "channel_id": 1, "username": "Albert", "message": "Hola" }`
- `GET action=poll&channel_id=1&after_id=10`: trae mensajes nuevos.

### Usuarios

- `GET action=users`: lista usuarios.
- `POST action=users`: crea usuario.
  - Body JSON: `{ "username": "DevAlbert" }`

## Versionado y buenas practicas

Se usa SemVer con formato visual `Vx.x.x`.

Version sincronizada en:

- `VERSION`
- `package.json`
- `public/version.json`
- `public/index.html` (badge de version)
- `CHANGELOG.md`

Politica recomendada:

1. Antes de cada commit, incrementar version (`patch`, `minor` o `major`).
2. Actualizar changelog con cambios reales.
3. Hacer commit incluyendo todos los archivos de version.

Comandos:

```powershell
npm run version:patch
npm run version:minor
npm run version:major
```

## Build

```powershell
npm run build
```

Genera `dist/` con archivos listos para despliegue.

## Dependencias

Dependencias runtime de app:

- PHP + PDO SQLite.
- JavaScript vanilla (sin frameworks).

Dependencias de tooling:

- Node.js (scripts locales en `scripts/`).

## Licencia

Este proyecto usa **Apache License 2.0**.

Ver archivo `LICENSE`.
