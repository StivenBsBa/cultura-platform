"use client";
import { SessionProvider } from "next-auth/react";
import { ForcedPasswordChangeModal } from "@/components/auth/forced-password-change-modal";
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ForcedPasswordChangeModal />
    </SessionProvider>
  );
}
