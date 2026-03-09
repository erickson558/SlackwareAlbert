# SlackwareAlbert

Aplicación de chat en tiempo real estilo Slack, desarrollada en PHP con arquitectura separada de backend y frontend.

Version actual: `V1.0.0`

## Características

- Canales de chat (`#general` y canales personalizados).
- Mensajería en tiempo real mediante polling.
- Backend PHP con API REST modular.
- Frontend desacoplado con JavaScript puro.
- Persistencia local con SQLite.
- Versionado semántico visible en la app y repositorio.
- Build automatizado con inclusión de favicon `.ico`.

## Arquitectura

- `api/`: Punto de entrada de la API REST.
- `src/config/`: Configuración de base de datos.
- `src/models/`: Modelos de dominio (`Channel`, `Message`).
- `src/controllers/`: Controladores de la API.
- `public/`: Frontend estático (`index.html`, `app.js`, `manifest.json`).
- `data/`: Base de datos SQLite en tiempo de ejecución (ignorado por git).
- `.github/workflows/`: CI/CD y publicación de releases.

## Requisitos

- PHP 8.0+ (recomendado). Funciona con PHP 7.4+.
- Extensión `pdo_sqlite` habilitada.
- PowerShell 5.1+ para scripts de build/versionado.

## Ejecución local

1. Coloca el proyecto en tu servidor local (EasyPHP).
2. Abre:
   - App: `http://localhost:888/monitoreos/SlackwareAlbert/`
   - API: `http://localhost:888/monitoreos/SlackwareAlbert/api/index.php?action=channels`

## Build

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

Resultado:

- Genera carpeta `dist/` lista para despliegue estático.
- Incluye el ícono `.ico` existente del proyecto.
- Copia `public`, `api`, `src` e `index.php`.

## Versionado

Formato: `Vx.x.x`.

- La versión vive en:
  - `VERSION`
  - `public/version.json`
  - Cabecera visible de la app (`public/index.html`)
- Cada commit en `main` debe crear una nueva versión.

Comandos disponibles:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\bump-version.ps1 -Type patch
powershell -ExecutionPolicy Bypass -File .\scripts\bump-version.ps1 -Type minor
powershell -ExecutionPolicy Bypass -File .\scripts\bump-version.ps1 -Type major
```

## Publicación en GitHub Pages

El workflow hace release automático en cada push a `main`.

Para sitio estático, puedes publicar `dist/public` en GitHub Pages (rama `gh-pages` o workflow adicional).

## Buenas prácticas aplicadas

- Separación de responsabilidades (controladores, modelos, configuración).
- Validación básica de entradas en backend.
- Prevención XSS en frontend con escape HTML.
- Estructura de proyecto mantenible.
- Documentación y licencia estándar.

## Licencia

Este proyecto está licenciado bajo **Apache License 2.0**.
Consulta `LICENSE` para el texto completo.
