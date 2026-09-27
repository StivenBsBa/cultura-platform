import { Box, CardActionArea, Typography } from "@mui/material";
import { CalendarDays, MapPin, Tags, ArrowRight } from "lucide-react";
import { LocationAutocomplete } from "@/components/public/location-autocomplete";
import { PageContainer } from "@/components/ui/page-container";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
export default function HomePage() {
  return (
    <>
      <main>
        <Box component="section" sx={{ bgcolor: "background.default" }}>
          <PageContainer sx={{ pt: { xs: 8, md: 14 }, pb: { xs: 6, md: 10 } }}>
            <Typography component="p" sx={{ color: "primary.main", fontWeight: 800 }}>
              CULTURA, TURISMO Y COMUNIDAD
            </Typography>
            <Typography
              component="h1"
              sx={{
                maxWidth: 920,
                fontSize: { xs: "3rem", sm: "5rem", lg: "7.5rem" },
                lineHeight: 0.96,
              }}
            >
              Encuentra historias para vivir cerca de ti.
            </Typography>
            <Typography component="p" sx={{ maxWidth: 680, color: "#48635b" }}>
              Explora eventos, museos, espacios naturales y experiencias culturales de tu ciudad.
            </Typography>
            <LocationAutocomplete />
          </PageContainer>
        </Box>
        <Box component="section" sx={{ bgcolor: "#fffdf8", py: { xs: 6, md: 11 } }}>
          <PageContainer>
            <Typography component="h2" variant="h4" sx={{ mb: 3 }}>
              Explora la plataforma
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                gap: 2.5,
              }}
            >
              <ExploreLink
                href="/eventos"
                icon={<CalendarDays size={28} />}
                title="Eventos próximos"
                description="Descubre qué hacer y vive nuevas experiencias."
                action="Ver agenda"
              />
              <ExploreLink
                href="/lugares"
                icon={<MapPin size={28} />}
                title="Lugares destacados"
                description="Encuentra museos, parques y espacios para visitar."
                action="Ver lugares"
              />
              <ExploreLink
                href="/categorias/museos"
                icon={<Tags size={28} />}
                title="Categorías"
                description="Explora la cultura por tus intereses."
                action="Explorar categorías"
              />
            </Box>
          </PageContainer>
        </Box>
      </main>
    </>
  );
}

function ExploreLink({
  href,
  icon,
  title,
  description,
  action,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <CardActionArea
      component={NextLinkAdapter}
      href={href}
      sx={{
        height: "100%",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        border: "1px solid #e3e8e2",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 0.75, mb: 1.5, color: "primary.main", bgcolor: "#fff1e8", borderRadius: 1 }}>
        {icon}
      </Box>
      <Typography component="h3" variant="h6">
        {title}
      </Typography>
      <Typography component="p" color="text.secondary">
        {description}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          mt: "auto",
          pt: 2,
          color: "primary.main",
          fontWeight: 700,
        }}
      >
        {action} <ArrowRight size={17} />
      </Box>
    </CardActionArea>
  );
}
