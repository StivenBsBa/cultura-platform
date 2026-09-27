import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import MuiButton from "@mui/material/Button";
import type { ReactNode } from "react";

type Props = Omit<MuiButtonProps, "color" | "variant" | "size" | "loading"> & {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children?: ReactNode;
  target?: string;
  rel?: string;
};
export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: Props) {
  const color: "primary" | "secondary" | "error" = variant === "destructive" ? "error" : variant === "secondary" ? "secondary" : "primary";
  return (
    <MuiButton
      className={className}
      variant={variant === "outline" ? "outlined" : variant === "ghost" ? "text" : "contained"}
      color={color}
      size={size === "md" ? "medium" : size === "sm" ? "small" : "large"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "Cargando…" : children}
    </MuiButton>
  );
}
