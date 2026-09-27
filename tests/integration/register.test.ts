import { POST } from "@/app/api/v1/auth/register/route";
import { userService } from "@/lib/services/user.service";
import { vi, expect, it } from "vitest";
vi.mock("@/lib/cache/redis", () => ({ rateLimit: vi.fn().mockResolvedValue({ allowed: true }) }));
vi.mock("@/lib/services/user.service", () => ({
  userService: { register: vi.fn().mockResolvedValue({ id: "u", email: "ana@example.com" }) },
}));
it("registra un usuario sin passwordHash", async () => {
  const response = await POST(
    new Request("http://test/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Ana",
        email: "ana@example.com",
        password: "very-secure-password",
      }),
    }) as never,
  );
  expect(response.status).toBe(201);
  expect(await response.json()).not.toHaveProperty("passwordHash");
  expect(userService.register).toHaveBeenCalled();
});
