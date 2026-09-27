# Instrucciones del repositorio

Este proyecto usa Next.js 16 + React 19 + TypeScript, MUI para UI y layout, Prisma + PostgreSQL/PostGIS, Redis, RustFS/S3 para media, Auth.js para autenticación, MapLibre para mapas, Docker y Docker Compose para entorno local. Sigue estas reglas al trabajar:

- Mantén la arquitectura actual: app router de Next, rutas en app/, componentes reutilizables en components/, lógica de negocio y acceso a datos en lib/ y prisma/.
- Usa MUI y `sx` para estilos cuando el componente necesite layout, espaciado, breakpoints o patrones visuales reutilizables. Evita CSS manual nuevo y no agregues archivos CSS si el comportamiento puede resolverse con MUI.
- No reescribas componentes que ya funcionan ni introduzcas stacks paralelas. Reusa los patrones existentes: `PageContainer`, `Button`, `AppThemeProvider`, `NextLinkAdapter`, `MediaAsset`/uploader y el editor enriquecido ya integrado.
- Prisma no debe renombrarse ni reestructurarse sin migración demostrable. Mantén nombres, tipos y labels coherentes entre prisma, API, formularios y UI.
- Los uploads y media se gestionan con RustFS/S3; no guardes binarios o base64 en PostgreSQL. Usa `mediaId` y URLs públicas/compatibles con el navegador junto a metadata.
- Auth.js, Redis y Postgres tienen responsabilidades separadas: sesiones/autorización, caché y colas, y persistencia geoespacial respectivamente. No mezclarlos en capas o clientes distintos.
- Docker debe mantener URLs internas (`postgres`, `redis`, `rustfs`) aisladas de URLs públicas para navegador. Las exposures públicas deben limitarse a la app y al endpoint de media que realmente requiera el navegador.
- Cuando detectes archivos o estilos sin referencias, elimínalos solo tras verificarlos con búsqueda y validación.
- Antes de agregar dependencias nuevas, comprueba si ya existe una solución adecuada dentro del stack actual.
- Si una decisión afecta infraestructura, despliegue o seguridad, prioriza soluciones pequeñas y verificables sobre cambios amplios.

## Estructura clave

- App: rutas en `app/` y layouts.
- UI: `components/ui/`, `components/layout/`, `components/public/`.
- Formularios y admin: `components/forms/`, `components/admin/`.
- Editor y media: `components/editor/`, `lib/content/`, `lib/storage/`, `lib/services/`.
- Datos: `prisma/schema.prisma`, `lib/repositories/`, `lib/services/`.
- Infra: `docker-compose.yml`, `docker/`, `scripts/`.

## Validación mínima

- Ejecuta typecheck y lint tras cambios relevantes.
- Revisa si un archivo CSS o un componente ya no está referenciado antes de eliminarlo.
- Haz cambios incrementales y verificados, no reescrituras masivas.
