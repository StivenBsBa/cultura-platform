import { ContentStatus, Role } from "@/generated/prisma/client";
import {
  eventCreateSchema,
  eventQuerySchema,
  eventUpdateSchema,
} from "@/lib/validations/event.schema";
import { placeQuerySchema, placeUpdateSchema } from "@/lib/validations/place.schema";
import { adminUserUpdateSchema, registerSchema } from "@/lib/validations/user.schema";
describe("validations", () => {
  it("limita coordenadas", () =>
    expect(placeQuerySchema.safeParse({ lat: 100, lng: 0 }).success).toBe(false));
  it("rechaza filtros de estado en listados públicos", () => {
    expect(eventQuerySchema.safeParse({ status: "DRAFT" }).success).toBe(false);
    expect(placeQuerySchema.safeParse({ status: "PENDING_REVIEW" }).success).toBe(false);
  });
  it("normal validation rejects short passwords", () =>
    expect(
      registerSchema.safeParse({ name: "Ana", email: "ana@example.com", password: "short" })
        .success,
    ).toBe(false));
  it("normaliza el correo durante el registro", () =>
    expect(
      registerSchema.parse({ name: "Ana", email: " ANA@EXAMPLE.COM ", password: "password-123" })
        .email,
    ).toBe("ana@example.com"));
  it("bloquea role y campos extra en registro público", () =>
    expect(
      registerSchema.safeParse({
        name: "Ana",
        email: "ana@example.com",
        password: "password-123",
        role: Role.ADMIN,
      }).success,
    ).toBe(false));
  it("no permite asignar ADMIN desde la actualización administrativa", () =>
    expect(
      adminUserUpdateSchema.safeParse({
        userId: "clx123456789012345678901",
        role: Role.ADMIN,
      }).success,
    ).toBe(false));
  it("acepta PATCH parcial de evento y rechaza una ocurrencia inválida", () => {
    expect(eventUpdateSchema.safeParse({ status: ContentStatus.ARCHIVED }).success).toBe(true);
    expect(
      eventCreateSchema.safeParse({
        name: "Evento cultural",
        summary: "Resumen válido con la longitud requerida.",
        price: 0,
        placeId: "clx123456789012345678901",
        categoryIds: [],
        occurrences: [
          {
            startsAt: "2026-10-10T12:00:00Z",
            endsAt: "2026-10-10T11:00:00Z",
            timezone: "America/Bogota",
          },
        ],
      }).success,
    ).toBe(false);
  });
  it("acepta varias ocurrencias válidas", () =>
    expect(
      eventCreateSchema.safeParse({
        name: "Evento cultural",
        summary: "Resumen válido con la longitud requerida.",
        price: 0,
        placeId: "clx123456789012345678901",
        categoryIds: [],
        occurrences: [
          {
            startsAt: "2026-10-10T10:00:00Z",
            endsAt: "2026-10-10T11:00:00Z",
            timezone: "America/Bogota",
          },
          {
            startsAt: "2026-10-11T10:00:00Z",
            endsAt: "2026-10-11T11:00:00Z",
            timezone: "America/Bogota",
          },
        ],
      }).success,
    ).toBe(true));
  it("requiere ambas coordenadas si se actualiza un lugar", () =>
    expect(placeUpdateSchema.safeParse({ lat: 6.2 }).success).toBe(false));
});
