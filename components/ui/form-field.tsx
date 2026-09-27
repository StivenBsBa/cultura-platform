"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Box, FormHelperText, OutlinedInput, Select as MuiSelect, Typography } from "@mui/material";
import type { SelectProps } from "@mui/material/Select";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "color" | "size"> & {
  sx?: object;
};

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box component="label" htmlFor={htmlFor} sx={{ display: "grid", gap: 0.75, width: "100%" }}>
      <Box component="span" sx={{ fontWeight: 500 }}>
        {label}
      </Box>
      {children}
      {hint && (
        <Typography component="small" variant="caption" sx={{ color: "text.secondary" }}>
          {hint}
        </Typography>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Box>
  );
}
export function Input({ className, sx, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "color" | "size"> & { sx?: object }) {
  return <OutlinedInput fullWidth size="small" className={className} sx={sx} {...props} />;
}
export function Textarea({ className, sx, rows, ...props }: TextareaProps) {
  return (
    <OutlinedInput
      fullWidth
      multiline
      minRows={rows ?? 3}
      className={className}
      sx={sx}
      {...(props as Record<string, unknown>)}
    />
  );
}
export function Select({ className, sx, ...props }: Omit<SelectProps<string>, "size"> & { className?: string; sx?: object }) {
  return <MuiSelect fullWidth size="small" variant="outlined" className={className} sx={sx} {...props} />;
}
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <FormHelperText error component="small" role="alert">
      {children}
    </FormHelperText>
  );
}
