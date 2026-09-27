import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password", () => {
  it("acepta únicamente la contraseña correspondiente al hash", async () => {
    const hash = await hashPassword("password-123");
    await expect(verifyPassword(hash, "password-123")).resolves.toBe(true);
    await expect(verifyPassword(hash, "incorrecta")).resolves.toBe(false);
  });

  it("trata hashes inválidos como credenciales inválidas", async () => {
    await expect(verifyPassword("hash-inválido", "password-123")).resolves.toBe(false);
  });
});
