import { apiError } from "./response";
export function serviceError(error: unknown) {
  const code = error instanceof Error ? error.message : "INTERNAL";
  if (code === "FORBIDDEN") return apiError("Forbidden", 403);
  if (code === "NOT_FOUND") return apiError("Not found", 404);
  if (code === "INVALID_MEDIA_REFERENCE")
    return apiError("Una imagen del contenido no existe o no te pertenece.", 422);
  if (code === "INVALID_CATEGORY_SCOPE")
    return apiError("Una o más categorías no pueden usarse en este tipo de contenido.", 422);
  if (code === "INVALID_OCCURRENCE")
    return apiError("Una ocurrencia no pertenece a este evento.", 422);
  if (code === "EMAIL_EXISTS") return apiError("Email already registered", 409);
  if (code === "CATEGORY_IN_USE") return apiError("Category is in use", 409);
  if (code === "USER_HAS_CONTENT")
    return apiError("No se puede eliminar: el usuario tiene contenido o archivos asociados.", 409);
  console.error("API error", { code });
  return apiError("Internal server error", 500);
}
