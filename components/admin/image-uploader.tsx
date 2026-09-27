"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionGroup } from "@/components/ui/entity-card";
import { Box, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
const types = ["image/jpeg", "image/png", "image/webp"];
const OUTPUT_SIZE = 512;
export function ImageUploader({
  kind,
  entityId,
  onUploaded,
}: {
  kind: "EVENT" | "PLACE" | "USER" | "CATEGORY";
  entityId?: string;
  onUploaded?: (url: string, mediaId?: string) => void;
}) {
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [cropSrc, setCropSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  function drawCrop(
    target: HTMLCanvasElement,
    image: HTMLImageElement,
    currentZoom: number,
    x: number,
    y: number,
  ) {
    target.width = OUTPUT_SIZE;
    target.height = OUTPUT_SIZE;
    const context = target.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    const scale =
      Math.max(OUTPUT_SIZE / image.naturalWidth, OUTPUT_SIZE / image.naturalHeight) * currentZoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(
      image,
      (OUTPUT_SIZE - width) / 2 + x,
      (OUTPUT_SIZE - height) / 2 + y,
      width,
      height,
    );
  }
  useEffect(() => {
    if (source && canvasRef.current) drawCrop(canvasRef.current, source, zoom, offsetX, offsetY);
  }, [source, zoom, offsetX, offsetY]);
  const limits = source
    ? (() => {
        const scale =
          Math.max(OUTPUT_SIZE / source.naturalWidth, OUTPUT_SIZE / source.naturalHeight) * zoom;
        return {
          x: Math.max(0, (source.naturalWidth * scale - OUTPUT_SIZE) / 2),
          y: Math.max(0, (source.naturalHeight * scale - OUTPUT_SIZE) / 2),
        };
      })()
    : { x: 0, y: 0 };
  async function upload(file: File) {
    setUploading(true);
    setStatus("Subiendo…");
    try {
      const presign = await fetch("/api/v1/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          entityId,
          mimeType: file.type,
          size: file.size,
          filename: file.name,
        }),
      });
      const presignResult = await presign.json().catch(() => null);
      if (!presign.ok)
        throw new Error(presignResult?.error?.message ?? "No fue posible preparar la subida.");
      const put = await fetch(presignResult.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("No fue posible transferir la imagen a RustFS.");
      const complete = await fetch("/api/v1/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectKey: presignResult.data.objectKey }),
      });
      const result = await complete.json().catch(() => null);
      if (!complete.ok)
        throw new Error(result?.error?.message ?? "No fue posible registrar la imagen.");
      setPreview(result.data.url);
      setStatus("Imagen subida correctamente.");
      onUploaded?.(result.data.url, result.data.id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible subir la imagen.");
    } finally {
      setUploading(false);
    }
  }
  function select(file: File) {
    if (!types.includes(file.type)) {
      setStatus("Formato no permitido. Usa JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("La imagen no puede superar 5 MB.");
      return;
    }
    // Solo el avatar requiere composición cuadrada. Las portadas conservan su
    // proporción original durante toda la subida.
    if (kind !== "USER") {
      setPreview(URL.createObjectURL(file));
      void upload(file);
      return;
    }
    const image = new Image();
    image.onload = () => {
      setSource(image);
      setCropSrc(image.src);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    image.src = URL.createObjectURL(file);
  }
  function confirmCrop() {
    if (!source || !canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          setStatus("No se pudo generar el recorte.");
          return;
        }
        setCropSrc("");
        setSource(null);
        void upload(new File([blob], "avatar.webp", { type: "image/webp" }));
      },
      "image/webp",
      0.9,
    );
  }
  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Typography component="p" color="text.secondary">
        Formatos permitidos: JPG, PNG y WebP. Tamaño máximo: 5 MB.
      </Typography>
      <Button component="label" disabled={uploading}>
        Seleccionar imagen
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) select(file);
            event.currentTarget.value = "";
          }}
        />
      </Button>
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="Vista previa"
          sx={{
            maxWidth: 280,
            maxHeight: 180,
            width: kind === "USER" ? 80 : "auto",
            aspectRatio: kind === "USER" ? "1" : undefined,
            objectFit: "cover",
            borderRadius: kind === "USER" ? "50%" : 1.5,
          }}
        />
      )}
      {status && <p role="status">{status}</p>}
      {cropSrc && (
        <Dialog
          open
          onClose={() => {}}
          maxWidth={false}
          slotProps={{ paper: { sx: { width: "min(100% - 2rem, 500px)" } } }}
        >
          <DialogTitle id="crop-title">
            {kind === "USER" ? "Ajustar avatar" : "Ajustar imagen"}
          </DialogTitle>
          <DialogContent sx={{ display: "grid", gap: 2 }}>
            <Box
              sx={{
                width: "min(100%, 360px)",
                aspectRatio: 1,
                mx: "auto",
                my: 1,
                overflow: "hidden",
                borderRadius: "50%",
              }}
            >
              <Box
                component="canvas"
                ref={canvasRef}
                aria-label="Vista previa del avatar recortado"
                sx={{ width: "100%", height: "100%" }}
              />
            </Box>
            <Box component="label" sx={{ display: "grid", gap: 0.75 }}>
              Zoom
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(event) => {
                  const nextZoom = Number(event.target.value);
                  setZoom(nextZoom);
                  const scale = source
                    ? Math.max(
                        OUTPUT_SIZE / source.naturalWidth,
                        OUTPUT_SIZE / source.naturalHeight,
                      ) * nextZoom
                    : 1;
                  const nextX = source
                    ? Math.max(0, (source.naturalWidth * scale - OUTPUT_SIZE) / 2)
                    : 0;
                  const nextY = source
                    ? Math.max(0, (source.naturalHeight * scale - OUTPUT_SIZE) / 2)
                    : 0;
                  setOffsetX((value) => Math.min(nextX, Math.max(-nextX, value)));
                  setOffsetY((value) => Math.min(nextY, Math.max(-nextY, value)));
                }}
              />
            </Box>
            <Box component="label" sx={{ display: "grid", gap: 0.75 }}>
              Mover horizontal
              <input
                type="range"
                min={-limits.x}
                max={limits.x}
                value={offsetX}
                onChange={(event) => setOffsetX(Number(event.target.value))}
              />
            </Box>
            <Box component="label" sx={{ display: "grid", gap: 0.75 }}>
              Mover vertical
              <input
                type="range"
                min={-limits.y}
                max={limits.y}
                value={offsetY}
                onChange={(event) => setOffsetY(Number(event.target.value))}
              />
            </Box>
            <ActionGroup>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setZoom(1);
                  setOffsetX(0);
                  setOffsetY(0);
                }}
                disabled={uploading}
              >
                Restablecer
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setCropSrc("");
                  setSource(null);
                }}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={confirmCrop} loading={uploading}>
                Usar avatar
              </Button>
            </ActionGroup>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
