import { Box, Link as MuiLink } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export function SiteFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#153c32", color: "#e9f1eb" }}>
      <PageContainer sx={{ pt: { xs: 5, md: 8 }, pb: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "1.2fr repeat(3, minmax(0, 1fr))" },
            gap: 3,
            mb: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box component="strong" sx={{ fontWeight: 700 }}>
              Cultura Platform
            </Box>
            <Box component="p" sx={{ my: 1.25, maxWidth: 260 }}>
              Descubre cultura, eventos y lugares.
            </Box>
          </Box>
          <FooterNav
            label="Explorar"
            links={[
              ["/eventos", "Eventos"],
              ["/lugares", "Lugares"],
              ["/categorias", "Categorías"],
            ]}
          />
          <FooterNav
            label="Cuenta"
            links={[
              ["/dashboard", "Dashboard"],
              ["/login", "Ingresar"],
              ["/registro", "Registrarse"],
            ]}
          />
          <FooterNav
            label="Información"
            links={[
              ["/acerca", "Acerca de"],
              ["/privacidad", "Privacidad"],
              ["/terminos", "Términos"],
            ]}
          />
        </Box>
        <Box component="small" sx={{ display: "block", opacity: 0.8 }}>
          © {new Date().getFullYear()} Cultura Platform
        </Box>
      </PageContainer>
    </Box>
  );
}

function FooterNav({ label, links }: { label: string; links: [string, string][] }) {
  return (
    <Box component="nav" aria-label={label}>
      <Box component="strong" sx={{ fontWeight: 700 }}>
        {label}
      </Box>
      <Box
        component="ul"
        sx={{ display: "grid", gap: 0.75, mt: 1.5, mb: 0, pl: 0, listStyle: "none" }}
      >
        {links.map(([href, text]) => (
          <Box component="li" key={href}>
            <MuiLink component={NextLinkAdapter} href={href} underline="hover" color="inherit">
              {text}
            </MuiLink>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
