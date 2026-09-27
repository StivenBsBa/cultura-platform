import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { Modal } from "@/components/ui/modal";

export function DetailModal({
  title,
  children,
  onClose,
  contentSx,
  size,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  contentSx?: SxProps<Theme>;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Modal title={title} onClose={onClose} contentSx={contentSx} size={size}>
      {children}
    </Modal>
  );
}
