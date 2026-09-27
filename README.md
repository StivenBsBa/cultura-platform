# Cultura Platform

Documentación principal de la plataforma cultural: eventos, lugares, categorías, favoritos, moderación, contenido enriquecido y búsqueda geográfica.

## Requisitos

- Git, Docker Engine con Docker Compose.
- Node.js >=20.19.0 y npm 10+. La imagen Docker usa Node 24.
- No hay `.nvmrc`; con nvm active una versión compatible antes de instalar.

## Instalación desde cero

```bash
git clone <URL_DEL_REPOSITORIO>
cd cultura-platform
npm install
cp .env.example .env
```

Edite `.env` y sustituya `POSTGRES_PASSWORD`, `AUTH_SECRET`, `S3_ACCESS_KEY_ID` y `S3_SECRET_ACCESS_KEY`. Puede generar secretos con:

```bash
openssl rand -base64 48
```

Para desarrollo desde host:

```bash
docker compose up -d postgres redis rustfs
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Para desarrollo local desde host, abre http://localhost:3000. Para ejecutar todo con Docker y acceder a la app pública, usa http://localhost:7120:

```bash
docker compose up -d --build
docker compose ps
```

El servicio `bootstrap` ejecuta `prisma migrate deploy` y luego el seed; si falla, `app` no inicia. El seed usa `upsert` y no duplica datos.

## Variables de entorno

Copie `.env.example`; no suba `.env`.

| Variable                      | Obligatoria           | Uso                                           | Ejemplo / origen                                                 |
| ----------------------------- | --------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `POSTGRES_USER`               | Compose               | Usuario PostgreSQL                            | `cultura`                                                        |
| `POSTGRES_PASSWORD`           | Sí en Compose         | Contraseña PostgreSQL                         | secreto generado                                                 |
| `DATABASE_URL`                | Sí fuera de Compose   | URL Prisma/PostgreSQL                         | `postgresql://...@localhost:5432/cultura_platform?schema=public` |
| `EXTERNAL_DATABASE_URL`       | No                    | Override PostgreSQL remoto en Compose         | URL del proveedor; incluye `sslmode=require` si aplica           |
| `RUN_DB_SEED`                 | No                    | Habilita seed durante bootstrap               | Externa: omitido por defecto; `true` lo ejecuta                  |
| `AUTH_SECRET`                 | Sí                    | Secreto Auth.js                               | `openssl rand -base64 48`                                        |
| `NEXTAUTH_SECRET`             | No                    | Alternativa con prioridad sobre `AUTH_SECRET` | secreto compatible                                               |
| `AUTH_URL`                    | Recomendado           | URL usada por layout, sitemap y robots        | `http://localhost:7120`                                          |
| `NEXTAUTH_URL`                | Sí                    | URL canónica de callbacks de NextAuth.js v4   | igual a `AUTH_URL`                                               |
| `REDIS_URL`                   | Recomendado           | Caché, rate limits y colas                    | `redis://localhost:6379`                                         |
| `S3_ENDPOINT`                 | Sí para uploads       | Endpoint servidor → RustFS                    | host: `http://localhost:9000`; Docker: `http://rustfs:9000`      |
| `S3_PUBLIC_ENDPOINT`          | Sí para URLs firmadas | Endpoint visible para navegador               | `http://localhost:9000`                                          |
| `S3_REGION`                   | Sí                    | Región S3                                     | `us-east-1`                                                      |
| `S3_BUCKET`                   | Sí                    | Bucket de media                               | `cultura-media`                                                  |
| `S3_ACCESS_KEY_ID`            | Sí                    | Access key RustFS/aplicación                  | valor aleatorio                                                  |
| `S3_SECRET_ACCESS_KEY`        | Sí                    | Secret key RustFS/aplicación                  | valor aleatorio                                                  |
| `S3_FORCE_PATH_STYLE`         | Sí                    | Compatibilidad RustFS                         | `true`                                                           |
| `RUSTFS_CORS_ALLOWED_ORIGINS` | Compose               | Orígenes para PUT directo                     | `http://localhost:7120`                                          |
| `RUSTFS_DATA_DIR`             | Compose               | Directorio host para RustFS                   | `/srv/cultura-platform/rustfs`                                   |
| `GEOAPIFY_API_KEY`            | Opcional              | Direcciones, POI y reverse geocoding          | key Geoapify                                                     |
| `GEOAPIFY_BASE_URL`           | No                    | Base Geoapify                                 | `https://api.geoapify.com`                                       |
| `NEXT_PUBLIC_MAP_STYLE_URL`   | No                    | Estilo MapLibre                               | URL de estilo                                                    |
| `NODE_ENV`                    | Docker                | Entorno Node                                  | `development` / `production`                                     |
| `NEXT_DIST_DIR`               | No                    | Directorio de build Next.js                   | sólo si se cambia                                                |

No existen como variables de aplicación `POSTGRES_DB`, `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY`, `SENTRY_DSN` ni `NEXT_PUBLIC_SENTRY_DSN`. Compose fija la base `cultura_platform` y mapea las credenciales S3 hacia variables internas de RustFS.

### Ejemplo .env desde host

```env
POSTGRES_USER="cultura"
POSTGRES_PASSWORD="CAMBIA_ESTE_SECRETO"
DATABASE_URL="postgresql://cultura:CAMBIA_ESTE_SECRETO@localhost:5432/cultura_platform?schema=public"
AUTH_SECRET="GENERA_UN_SECRETO_LARGO"
AUTH_URL="http://localhost:7120"
NEXTAUTH_URL="http://localhost:7120"
REDIS_URL="redis://localhost:6379"
S3_ENDPOINT="http://localhost:9000"
S3_PUBLIC_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET="cultura-media"
S3_ACCESS_KEY_ID="RUSTFS_ACCESS_KEY_SEGURA"
S3_SECRET_ACCESS_KEY="RUSTFS_SECRET_KEY_SEGURA"
S3_FORCE_PATH_STYLE="true"
RUSTFS_CORS_ALLOWED_ORIGINS="http://localhost:7120"
RUSTFS_DATA_DIR="/srv/cultura-platform/rustfs"
GEOAPIFY_API_KEY=""
GEOAPIFY_BASE_URL="https://api.geoapify.com"
NEXT_PUBLIC_MAP_STYLE_URL="https://demotiles.maplibre.org/style.json"
NODE_ENV="development"
```

Desarrollo host usa `localhost` para Postgres, Redis y RustFS; Compose publica Postgres/Redis
solo en loopback (`127.0.0.1`) y ambos modos comparten sus volúmenes/servicios. Dentro de Docker,
la app usa los nombres internos `postgres`, `redis` y `rustfs`. El runner del contenedor fija
`NODE_ENV=production`; `.env` mantiene `development` para `npm run dev` en el host.

Para usar PostgreSQL remoto en Compose, configure `EXTERNAL_DATABASE_URL`; se aplicarán allí
las migraciones y el seed demo se omitirá por defecto. Use `RUN_DB_SEED=true` solo para cargar
datos demo intencionalmente. No se publica el puerto de PostgreSQL en interfaces externas.

### Secretos y Geoapify

- PostgreSQL: `DATABASE_URL` debe coincidir con usuario y contraseña. Host usa `localhost`; Docker usa `postgres`.
- RustFS: `S3_ACCESS_KEY_ID` y `S3_SECRET_ACCESS_KEY` inician RustFS y permiten firmar uploads. Genere valores con `openssl rand -hex 24`. El bucket es `cultura-media`.
- Geoapify: cree cuenta, proyecto y API key; copie la key a `GEOAPIFY_API_KEY`. Nunca use `NEXT_PUBLIC_`: sólo se usa en backend.

Docker entrega `GEOAPIFY_API_KEY` y `GEOAPIFY_BASE_URL` al contenedor `app`; reinícielo tras modificar `.env`.

## Docker

Servicios: `app` (7120), `postgres`, `redis`, `rustfs` y `bootstrap`.

```bash
docker compose up -d postgres redis rustfs
docker compose up -d
docker compose build
docker compose build --no-cache
docker compose ps
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f rustfs
docker compose down
```

PostgreSQL y Redis usan named volumes (`postgres_data`, `redis_data`). RustFS usa el bind mount configurado por `RUSTFS_DATA_DIR` hacia `/data`.

> **Destructivo:** `docker compose down -v --remove-orphans` elimina named volumes de PostgreSQL y Redis. No borra automáticamente el bind mount de RustFS; respáldelo antes de borrarlo manualmente.

PostgreSQL y Redis están sólo en la red interna. RustFS expone API en `127.0.0.1:9000`; la consola usa el puerto interno 9001 y no se publica. Next standalone corre como usuario `cultura` (UID 10001), con healthcheck y reinicio automático.

## PostgreSQL, Prisma y seed

PostgreSQL incluye PostGIS. `Place.location` es `geography(Point,4326)`, con índice GiST; proximidad usa `ST_DWithin` y `ST_Distance`.

```bash
npm run db:generate
npx prisma migrate deploy
npx prisma migrate status
npm run db:seed
npm run db:migrate
npm run db:studio
```

El seed idempotente crea Colombia, Antioquia, Medellín, ocho categorías, tres usuarios, cuatro lugares publicados y un evento demo. Cuentas: `admin@example.com`, `creator@example.com`, `user@example.com`; contraseña de desarrollo: `LocalDevOnly123!`. No usar en producción.

## Geolocalización

Flujo: `LocationAutocomplete` → `/api/v1/locations/search` → Zod → `LocationService` → resultados locales + `GeoapifyService` → Geoapify. También: `/api/v1/locations/reverse` y `/api/v1/cities?regionId=`.

- Autocomplete: mínimo tres caracteres, debounce 300 ms, cancelación y límite de resultados.
- Ciudades y Places `PUBLISHED` locales aparecen antes que direcciones/POI. City/Region son autoritativos PostgreSQL; Geoapify no crea Places.
- Geoapify usa autocomplete, forward y reverse, restringido a Colombia; la key no llega al navegador.
- Redis cachea autocomplete 10 min y reverse 24 h; rutas con rate limit IP. Si Geoapify falla, siguen resultados locales.
- Home filtra City por `cityId`; dirección/POI o ubicación abre resultados cercanos. Radios 5, 10, 25, 50 km, mediante PostGIS y sólo Places `PUBLISHED`.
- MapLibre usa `NEXT_PUBLIC_MAP_STYLE_URL`; Place permite clic/arrastre de marcador. Reverse sólo propone dirección vacía, no sobrescribe texto manual.

## Imágenes y RustFS

Flujo: archivo → `/api/v1/uploads/presign` → PUT directo a RustFS → `/api/v1/uploads/complete` → `MediaAsset` → metadata en PostgreSQL y archivo físico en RustFS.

PostgreSQL no guarda binarios ni base64. `MediaAsset` contiene `url`, `objectKey`, `alt`, `mimeType`, `size`, `width`, `height`, `provider`, `ownerId` y fecha. `Event.coverMediaId` y `Place.coverMediaId` apuntan a MediaAsset.

Tiptap guarda JSON estructurado: `mediaId` → MediaAsset → objectKey → RustFS. No guarde base64 ni URLs firmadas expirables; editor, preview y página pública usan esa referencia.

**Avatares — estado actual:** `User.image` guarda URL; no existe `avatarMediaId`. El perfil recibe la URL del uploader y la detección de uso compara `User.image` con `MediaAsset.url`.

Se aceptan JPG/JPEG, PNG y WebP hasta 5 MB. Se valida MIME, extensión, magic bytes/firma y dimensiones válidas.

### RustFS GUI y endpoints

La API local es `http://localhost:9000`. La consola está en puerto interno 9001, no publicada al host. Use credenciales S3 configuradas. `S3_ENDPOINT` es servidor → RustFS (`http://rustfs:9000` dentro Docker); `S3_PUBLIC_ENDPOINT` es navegador → RustFS. No use `rustfs:9000` como endpoint público.

## Permisos, comandos y soporte

Roles: `USER`, `CREATOR`, `MODERATOR`, `ADMIN`. CREATOR crea y envía a revisión; MODERATOR modera creadores y no aprueba lo propio; ADMIN tiene autoridad final, incluida aprobación de moderadores.

Estados: `DRAFT` → `PENDING_REVIEW` → `PUBLISHED`, con `REJECTED` y `ARCHIVED`. Listados públicos y cercanos devuelven sólo `PUBLISHED`.

| Comando                                                     | Función                              |
| ----------------------------------------------------------- | ------------------------------------ |
| `npm run dev`                                               | Desarrollo Next.js                   |
| `npm run build` / `npm run start`                           | Build y producción                   |
| `npm run typecheck` / `npm run lint`                        | TypeScript y ESLint                  |
| `npm run format` / `npm run format:check`                   | Formatea / comprueba Prettier        |
| `npm run test`                                              | Unit e integration consecutivos      |
| `npm run test:unit` / `npm run test:integration`            | Suites Vitest                        |
| `npm run test:e2e`                                          | Playwright; inicia dev si hace falta |
| `npm run db:generate`, `db:migrate`, `db:seed`, `db:studio` | Prisma                               |
| `npm run docker:up` / `npm run docker:down`                 | Compose                              |

Para E2E, si faltan browsers:

```bash
npx playwright install
```

El único E2E activo valida registro; los flujos con base seed están en `skip`. Playwright escribe resultados en `/tmp/cultura-platform-playwright`.

### Troubleshooting y seguridad

- Prisma no conecta: revise `DATABASE_URL`, PostgreSQL y host correcto (`localhost` host, `postgres` Docker).
- Redis 6379 ocupado: detenga proceso local; Compose no lo publica.
- Migraciones: ejecute `npx prisma migrate status`; bootstrap aborta si migration/seed fallan.
- Presigned URL: navegador requiere `S3_PUBLIC_ENDPOINT`, no `rustfs:9000`; confirme CORS y API 9000.
- Geoapify externo: configure key; inyectarla en Docker está pendiente.
- Tiptap: complete upload y use `mediaId`.
- Permisos `.next`/tests: trate sólo artefactos generados; Docker UID 10001 y Playwright `/tmp`.

Nunca publique `.env`, keys ni secretos; rote filtraciones. Mantenga PostgreSQL/Redis privados. Producción requiere HTTPS para Auth/S3, reverse proxy RustFS si uploads remotos y backups con `pg_dump` y del directorio RustFS.
