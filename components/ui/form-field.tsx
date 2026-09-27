"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { FormHelperText, OutlinedInput, Select as MuiSelect } from "@mui/material";
import type { SelectProps } from "@mui/material/Select";

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
    <label className="form-field" htmlFor={htmlFor}>
      {label}
      {children}
      {hint && <small className="field-hint">{hint}</small>}
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <OutlinedInput fullWidth size="small" className={className} inputProps={props} />;
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <OutlinedInput fullWidth multiline minRows={3} className={className} inputProps={props} />;
}
export function Select({ className, ...props }: Omit<SelectProps<string>, "size">) {
  return <MuiSelect fullWidth size="small" variant="outlined" className={className} {...props} />;
}
export function FieldError({ children }: { children: ReactNode }) {
  return (
    <FormHelperText error component="small" role="alert">
      {children}
    </FormHelperText>
  );
}
