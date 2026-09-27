import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";

export function EmptyState({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Paper
      component="p"
      className={className}
      role="status"
      sx={{ p: 2, m: 0, textAlign: "center", color: "text.secondary" }}
    >
      {children}
    </Paper>
  );
}
