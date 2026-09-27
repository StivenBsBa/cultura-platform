import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { AppThemeProvider } from "@/components/ui/app-theme-provider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
export const metadata: Metadata = {
  title: { default: "Cultura Platform", template: "%s | Cultura Platform" },
  description: "Eventos, lugares y experiencias culturales.",
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:7120"),
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>
            <AuthSessionProvider>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </AuthSessionProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
