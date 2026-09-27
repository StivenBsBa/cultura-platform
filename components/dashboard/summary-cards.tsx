import { Box, Paper, Typography } from "@mui/material";
import { NextLinkAdapter } from "@/components/ui/next-link-adapter";
type SummaryCard = { label: string; value: number; href: string };
export function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map((card) => (
        <Paper
          component={NextLinkAdapter}
          href={card.href}
          key={card.label}
          variant="outlined"
          sx={{
            p: 2.5,
            display: "grid",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
            "&:hover": { borderColor: "primary.main", boxShadow: 1 },
          }}
        >
          <Typography color="text.secondary">{card.label}</Typography>
          <Typography component="strong" variant="h4" sx={{ fontWeight: 700 }}>
            {card.value}
          </Typography>
          <Typography color="primary.main">Ver sección →</Typography>
        </Paper>
      ))}
    </Box>
  );
}
