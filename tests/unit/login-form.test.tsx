import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));

vi.mock("next-auth/react", () => ({ signIn: mocks.signIn }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

import { LoginForm } from "@/components/forms/login-form";

describe("LoginForm", () => {
  it("inicia sesión y redirige al dashboard", async () => {
    mocks.signIn.mockResolvedValue({ ok: true });
    const { container } = render(<LoginForm />);
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: "ana@example.com" } });
    fireEvent.change(container.querySelector('input[name="password"]')!, { target: { value: "password-123" } });

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/dashboard"));
    expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
      email: "ana@example.com",
      password: "password-123",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("muestra un mensaje cuando signIn falla por red", async () => {
    mocks.signIn.mockRejectedValue(new Error("network"));
    const { container } = render(<LoginForm />);
    fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: "ana@example.com" } });
    fireEvent.change(container.querySelector('input[name="password"]')!, { target: { value: "password-123" } });

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No fue posible iniciar sesión");
  });
});
