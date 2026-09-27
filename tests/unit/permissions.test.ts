import { ContentStatus, Role } from "@/generated/prisma/client";
import {
  canCreateContent,
  canEditEvent,
  contentActionsFor,
  canManageUsers,
  canModerate,
  canTransitionContent,
} from "@/lib/permissions";
describe("permissions", () => {
  const user = { id: "user", role: Role.USER };
  it("permite contenido a CREATOR", () =>
    expect(canCreateContent({ ...user, role: Role.CREATOR })).toBe(true));
  it("bloquea USER", () => expect(canCreateContent(user)).toBe(false));
  it("permite a CREATOR editar su propio contenido", () =>
    expect(canEditEvent({ ...user, role: Role.CREATOR }, "user")).toBe(true));
  it("bloquea a USER aunque sea autor de contenido heredado", () =>
    expect(canEditEvent(user, "user")).toBe(false));
  it("reserva usuarios para ADMIN", () =>
    expect(canManageUsers({ ...user, role: Role.ADMIN })).toBe(true));
  it("reserva la moderación para MODERATOR y ADMIN", () => {
    expect(canModerate({ ...user, role: Role.MODERATOR })).toBe(true);
    expect(canModerate({ ...user, role: Role.ADMIN })).toBe(true);
    expect(canModerate({ ...user, role: Role.CREATOR })).toBe(false);
  });
  it("impide que MODERATOR apruebe su propio contenido", () =>
    expect(
      canTransitionContent(
        { id: "moderator", role: Role.MODERATOR },
        "moderator",
        Role.MODERATOR,
        ContentStatus.PENDING_REVIEW,
        ContentStatus.PUBLISHED,
      ),
    ).toBe(false));
  it("permite que ADMIN apruebe contenido de MODERATOR", () =>
    expect(
      canTransitionContent(
        { id: "admin", role: Role.ADMIN },
        "moderator",
        Role.MODERATOR,
        ContentStatus.PENDING_REVIEW,
        ContentStatus.PUBLISHED,
      ),
    ).toBe(true));
  it("permite editar sin cambio de estado", () =>
    expect(
      canTransitionContent(
        { id: "admin", role: Role.ADMIN },
        "moderator",
        Role.MODERATOR,
        ContentStatus.PUBLISHED,
        ContentStatus.PUBLISHED,
      ),
    ).toBe(true));
  it("impide que MODERATOR publique un borrador de CREATOR", () =>
    expect(
      canTransitionContent(
        { id: "moderator", role: Role.MODERATOR },
        "creator",
        Role.CREATOR,
        ContentStatus.DRAFT,
        ContentStatus.PUBLISHED,
      ),
    ).toBe(false));
  it("solo ofrece aprobar o rechazar a MODERATOR sobre pendientes de CREATOR", () =>
    expect(
      contentActionsFor(
        { id: "moderator", role: Role.MODERATOR },
        "creator",
        Role.CREATOR,
        ContentStatus.PENDING_REVIEW,
      ),
    ).toEqual(["EDIT", "DELETE", "APPROVE", "REJECT"]));
});
