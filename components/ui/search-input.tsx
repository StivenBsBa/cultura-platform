import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
type Props = InputHTMLAttributes<HTMLInputElement> & { onClear?: () => void };

export function SearchInput({ onClear, value, defaultValue, ...props }: Props) {
  const hasValue = Boolean(value ?? defaultValue);
  return (
    <OutlinedInput
      type="search"
      size="small"
      value={value}
      defaultValue={defaultValue}
      inputProps={props}
      startAdornment={
        <InputAdornment position="start">
          <Search size={18} aria-hidden="true" />
        </InputAdornment>
      }
      endAdornment={
        onClear && hasValue ? (
          <InputAdornment position="end">
            <IconButton type="button" size="small" onClick={onClear} aria-label="Limpiar búsqueda">
              <X size={16} />
            </IconButton>
          </InputAdornment>
        ) : undefined
      }
      sx={{ minWidth: "min(100%, 18rem)", flex: 1 }}
    />
  );
}
