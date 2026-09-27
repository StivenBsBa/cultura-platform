import type { HTMLAttributes, ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

export function EntityGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function ContentCardGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}
    >
      {children}
    </Box>
  );
}

export function SelectionChips({ children }: { children: ReactNode }) {
  return <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>{children}</Box>;
}

export function EntityCard({ children, className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <Paper
      component="article"
      className={className}
      variant="outlined"
      sx={{
        minHeight: 210,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        cursor: "pointer",
        boxShadow: "0 7px 20px rgba(17, 61, 49, 0.06)",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover, &:focus-visible": {
          transform: "translateY(-2px)",
          borderColor: "#85aa9b",
          boxShadow: "0 12px 26px rgba(17, 61, 49, 0.12)",
          outline: "none",
        },
        "& h2, & h3": { m: 0, fontSize: "1.1rem" },
        "& .entity-card-summary, & .entity-card-meta": { color: "text.secondary" },
        "& .entity-card-meta": { fontSize: "0.86rem" },
        "& .entity-card-summary": {
          display: "-webkit-box",
          m: 0,
          overflow: "hidden",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
        },
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

export function StatusBadge({ children }: { children: ReactNode }) {
  return <Chip label={children} size="small" color="secondary" />;
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 1,
        mt: 2.25,
      }}
    >
      {children}
    </Box>
  );
}
