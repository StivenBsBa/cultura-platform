import { Box, Link as MuiLink } from "@mui/material";
import { currentActor } from "@/lib/auth/session";
import { userRepository } from "@/lib/repositories/user.repository";
import { PrimaryNav } from "./primary-nav";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export async function SiteHeader() {
  const actor = await currentActor();
  const user = actor ? await userRepository.findPublicById(actor.id) : null;
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        bgcolor: "#153c32",
        color: "#f8f4ea",
        borderBottom: "1px solid #2b5b4c",
      }}
    >
      <PageContainer
        sx={{
          minHeight: { xs: 64, md: 72 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 1.5, md: 4 },
          py: { xs: 1.5, md: 0 },
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <MuiLink
          component={NextLinkAdapter}
          href="/"
          underline="none"
          sx={{ fontWeight: 800, fontSize: "1.45rem", whiteSpace: "nowrap", color: "inherit" }}
        >
          Cultura Platform
        </MuiLink>
        <PrimaryNav
          user={
            user ? { name: user.name, email: user.email, role: user.role, image: user.image } : null
          }
        />
      </PageContainer>
    </Box>
  );
}
