# Ciclo de vida de MediaAsset

- La subida presignada crea primero un objeto bajo `*/<ownerId>/unattached/*`. Solo después de
  `POST /api/v1/uploads/complete` existe una fila `MediaAsset`; el objeto sin completar no es
  accesible por la aplicación.
- No configure una regla de ciclo de vida solo por prefijo: un objeto registrado puede conservar
  `unattached` en su key y esa regla podría borrarlo. La limpieza debe ser una tarea programada
  administrativa que liste el bucket, compare cada key con `MediaAsset.objectKey` y borre solo
  las que no tengan fila después de 24 horas. Antes de activarla debe ejecutarse en modo informe.
- Un `MediaAsset` registrado se conserva aunque se quite de un evento, lugar o contenido. Así
  puede revisarse y borrarse explícitamente desde Media. La eliminación comprueba avatar,
  portadas y referencias Tiptap antes de borrar el objeto en RustFS y la fila en PostgreSQL.
- La eliminación de usuarios queda bloqueada si todavía poseen `MediaAsset`; primero deben
  eliminarse o reasignarse sus archivos. Esto evita objetos huérfanos por cascada.
