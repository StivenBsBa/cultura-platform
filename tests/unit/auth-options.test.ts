import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findAuthByEmail: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("@/lib/repositories/user.repository", () => ({
  userRepository: { findAuthByEmail: mocks.findAuthByEmail },
}));
vi.mock("@/lib/auth/password", () => ({ verifyPassword: mocks.verifyPassword }));

import { authOptions } from "@/lib/auth/options";

type CredentialsProvider = {
  options: { authorize: (credentials?: Record<string, string>) => unknown };
};

const provider = authOptions.providers.find((item) => item.id === "credentials") as unknown as CredentialsProvider;

describe("CredentialsProvider", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normaliza el correo y crea la sesión solo con una contraseña válida", async () => {
    mocks.findAuthByEmail.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@example.com",
      role: "CREATOR",
      mustChangePassword: false,
      passwordHash: "hash",
    });
    mocks.verifyPassword.mockResolvedValue(true);

    expect(await provider.options.authorize({ email: " ANA@EXAMPLE.COM ", password: "password-123" })).toMatchObject({
      id: "user-1",
      email: "ana@example.com",
      role: "CREATOR",
    });
    expect(mocks.findAuthByEmail).toHaveBeenCalledWith("ana@example.com");
    expect(mocks.verifyPassword).toHaveBeenCalledWith("hash", "password-123");
  });

  it("rechaza credenciales ausentes o inválidas", async () => {
    expect(await provider.options.authorize({ email: "", password: "" })).toBeNull();
    mocks.findAuthByEmail.mockResolvedValue({ passwordHash: "hash" });
    mocks.verifyPassword.mockResolvedValue(false);
    expect(await provider.options.authorize({ email: "ana@example.com", password: "incorrecta" })).toBeNull();
  });
});
