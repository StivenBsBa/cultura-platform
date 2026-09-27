"use client";

import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

type Props = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  contentSx?: SxProps<Theme>;
  size?: "sm" | "md" | "lg";
};

const widths = { sm: 520, md: 680, lg: 960 };

export function Modal({ title, children, onClose, contentSx, size = "md" }: Props) {
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        paper: { sx: { width: widths[size], maxWidth: "calc(100vw - 2rem)", maxHeight: "90vh" } },
      }}
      aria-labelledby="modal-title"
    >
      <DialogTitle id="modal-title">{title}</DialogTitle>
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <X size={20} />
      </IconButton>
      <DialogContent sx={contentSx}>{children}</DialogContent>
    </Dialog>
  );
}
