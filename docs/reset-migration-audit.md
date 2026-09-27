# Auditoría para reset de migraciones

Reglas SQL manuales encontradas e incorporadas en la migración única `init`:

- `CREATE EXTENSION IF NOT EXISTS postgis` antes de crear `Place.location` como
  `geography(Point,4326)`.
- Índice espacial `Place_location_gist` mediante `USING GIST ("location")`.
- Índice parcial único `User_single_admin_role_idx` para permitir una sola fila con
  `role = 'ADMIN'`.

Las relaciones y sus reglas `CASCADE`, `RESTRICT` y `SET NULL` ya están expresadas en
`schema.prisma`; se generarán dentro de la migración inicial. No se hallaron triggers,
funciones, `CHECK` constraints ni defaults manuales adicionales que deban conservarse.
