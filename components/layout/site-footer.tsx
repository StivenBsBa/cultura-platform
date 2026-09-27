import { Box, Link as MuiLink } from "@mui/material";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export function SiteFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#153c32", color: "#e9f1eb" }}>
      <PageContainer sx={{ pt: 8, pb: 2.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 3,
            mb: 3,
          }}
        >
          <Box>
            <Box component="strong" sx={{ fontWeight: 700 }}>
              Cultura Platform
            </Box>
            <Box component="p">Descubre cultura, eventos y lugares.</Box>
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
        <Box component="small">© {new Date().getFullYear()} Cultura Platform</Box>
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
