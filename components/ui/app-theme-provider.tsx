"use client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#db6b35" },
    secondary: { main: "#32745d" },
    error: { main: "#b42318" },
    background: { default: "#f8f4ea", paper: "#fff" },
    text: { primary: "#183229", secondary: "#5c6c65" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Arial, sans-serif",
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { minHeight: "100%" },
        body: {
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f8f4ea",
          color: "#183229",
          fontFamily: "Arial, sans-serif",
        },
        "body > main": { flex: "1 0 auto" },
        "*, *::before, *::after": { boxSizing: "border-box" },
        a: { color: "inherit", textDecoration: "none" },
        "button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible":
          {
            outline: "3px solid #f0a66f",
            outlineOffset: 2,
          },
      },
    },
  },
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
